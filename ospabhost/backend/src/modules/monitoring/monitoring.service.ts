import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export class MonitoringService {
  private intervalId: NodeJS.Timeout | null = null;

  // Start monitoring service
  start() {
    console.log('Starting monitoring service...');
    
    // Check alerts every 5 minutes
    this.intervalId = setInterval(async () => {
      await this.checkAlerts();
      await this.cleanupOldMetrics();
    }, 5 * 60 * 1000);

    // Initial check
    this.checkAlerts();
  }

  // Stop monitoring service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Monitoring service stopped');
    }
  }

  // Check alerts for all servers
  private async checkAlerts() {
    try {
      const servers = await prisma.server.findMany({
        where: {
          status: 'running'
        },
        include: {
          user: true
        }
      });

      const rules = await prisma.alertRule.findMany({
        where: { enabled: true }
      });

      for (const server of servers) {
        for (const rule of rules) {
          await this.checkServerAlert(server, rule);
        }
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  // Check specific server against alert rule
  private async checkServerAlert(server: any, rule: any) {
    try {
      let currentValue = 0;

      switch (rule.metric) {
        case 'cpu':
          currentValue = server.cpuUsage || 0;
          break;
        case 'memory':
          currentValue = server.memoryUsage || 0;
          break;
        case 'disk':
          currentValue = server.diskUsage || 0;
          break;
        default:
          return;
      }

      let triggered = false;

      if (rule.condition === 'greater_than' && currentValue > rule.threshold) {
        triggered = true;
      } else if (rule.condition === 'less_than' && currentValue < rule.threshold) {
        triggered = true;
      }

      if (triggered) {
        // Check if alert was already sent recently (within last hour)
        const recentAlert = await prisma.alertNotification.findFirst({
          where: {
            serverId: server.id,
            ruleId: rule.id,
            createdAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000)
            }
          }
        });

        if (!recentAlert) {
          await this.createAlert(server, rule, currentValue);
        }
      }
    } catch (error) {
      console.error(`Error checking alert for server ${server.id}:`, error);
    }
  }

  // Create and send alert
  private async createAlert(server: any, rule: any, currentValue: number) {
    try {
      const message = `Alert: ${rule.name}
Server: ${server.id}
Metric: ${rule.metric}
Current Value: ${currentValue.toFixed(2)}%
Threshold: ${rule.threshold}%
Condition: ${rule.condition}`;

      const alert = await prisma.alertNotification.create({
        data: {
          serverId: server.id,
          ruleId: rule.id,
          message,
          sent: false
        }
      });

      // Send email notification
      await this.sendEmailAlert(server.user.email, message);

      // Mark as sent
      await prisma.alertNotification.update({
        where: { id: alert.id },
        data: {
          sent: true,
          sentAt: new Date()
        }
      });

      console.log(`Alert sent for server ${server.id}, rule ${rule.name}`);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  // Send email alert
  private async sendEmailAlert(email: string, message: string) {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('SMTP not configured, skipping email:', message);
        return;
      }

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Server Alert - ospabhost',
        text: message
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  // Cleanup old metrics (keep last 7 days)
  private async cleanupOldMetrics() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      await prisma.serverMetrics.deleteMany({
        where: {
          timestamp: {
            lt: sevenDaysAgo
          }
        }
      });

      console.log('Old metrics cleaned up');
    } catch (error) {
      console.error('Error cleaning up metrics:', error);
    }
  }

  // Create default alert rules
  async createDefaultRules() {
    const defaultRules = [
      {
        name: 'High CPU Usage',
        metric: 'cpu',
        threshold: 90,
        condition: 'greater_than',
        enabled: true
      },
      {
        name: 'High Memory Usage',
        metric: 'memory',
        threshold: 90,
        condition: 'greater_than',
        enabled: true
      },
      {
        name: 'High Disk Usage',
        metric: 'disk',
        threshold: 90,
        condition: 'greater_than',
        enabled: true
      }
    ];

    for (const rule of defaultRules) {
      await prisma.alertRule.upsert({
        where: { name: rule.name },
        update: rule,
        create: rule
      });
    }

    console.log('Default alert rules created');
  }
}

export const monitoringService = new MonitoringService();
