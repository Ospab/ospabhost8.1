
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-ospab-primary flex items-center justify-center py-20 px-4">
      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-2xl max-w-4xl mx-auto text-center border-4 border-ospab-primary/20">
        <h1 className="text-5xl md:text-6xl font-extrabold text-ospab-primary mb-8 drop-shadow-lg">История ospab.host</h1>
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <img src="/me.jpg" alt="Георгий" className="w-32 h-32 rounded-full shadow-lg border-4 border-ospab-primary mx-auto" />
          <div className="text-left md:text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Георгий, основатель</h2>
            <p className="text-lg text-gray-700 mb-2">Возраст: 13 лет</p>
            <p className="text-lg text-gray-700">Великий Новгород, Россия</p>
          </div>
        </div>
        <div className="text-lg text-gray-800 leading-relaxed mb-6">
          <p className="mb-4">В сентябре 2025 года я, Георгий, начал работу над первым дата-центром (ЦОД) и крупным хостингом в Великом Новгороде. Всё началось с мечты — создать место, где любой сможет разместить свой проект, сайт или сервер с максимальной надёжностью и скоростью.</p>
          <p className="mb-4">Сейчас я работаю над хостингом для будущего ЦОД, а мой друг-инвестор помогает с развитием инфраструктуры. Мы строим не просто сервис, а сообщество, где каждый клиент — как друг, а поддержка всегда рядом.</p>
          <p className="mb-4">ospab.host — это не просто хостинг. Это первый шаг к цифровому будущему Великого Новгорода, созданный с нуля школьником, который верит в технологии и силу дружбы.</p>
          <p className="mb-4">Наша миссия — сделать качественный хостинг доступным для всех, а ЦОД — гордостью города. Мы используем современные технологии, заботимся о безопасности и всегда готовы помочь.</p>
        </div>
        <div className="bg-ospab-primary/10 rounded-xl p-6 mt-8">
          <h3 className="text-2xl font-bold text-ospab-primary mb-2">Почему выбирают ospab.host?</h3>
          <ul className="list-disc list-inside text-lg text-gray-700 text-left mx-auto max-w-xl">
            <li>Первый ЦОД и крупный хостинг в Великом Новгороде</li>
            <li>Личная поддержка от основателя</li>
            <li>Современная инфраструктура и технологии</li>
            <li>Доступные тарифы для всех</li>
            <li>История, которой можно гордиться</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;