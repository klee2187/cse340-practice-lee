/**
 * Helper function to get the current greeting based on the time of day.
 */
const getCurrentGreeting = () => {

    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        return 'Good Morning!';
    }

    if (currentHour < 18) {
        return 'Good Afternoon!';
    }

    return 'Good Evening!';
};

const getSeasonalGreeting = () => {

    const month = new Date().getMonth();
    let greeting;

    if (month === 11 || month === 1) 
        return '🥶 Frosty greetings from someone who hasn’t felt their toes since November.';

    if (month >= 2 && month <= 4) 
        return '🪻 May your spring be sunny and your antihistamines strong.';
    
    if (month >= 5 && month <= 7) 
        return '🌞 Warm summer wishes from the land of iced drinks and questionable tan lines.';

    if (month >= 8 && month <= 10) 
        greeting = '🍂 Happy Fall! May your pumpkin spice be strong and your rakes be sturdy.';
};


/**
 * Middleware to add local variables to res.locals for use in all templates.
 */
export const addLocalVariables = (req, res, next) => {
    
    res.locals.currentYear = new Date().getFullYear();
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
    res.locals.queryParams = { ...req.query };
    res.locals.greeting = `<p>${getCurrentGreeting()}</p>`;
    res.locals.seasonalGreeting = `<p>${getSeasonalGreeting()}</p>`;

    const themes = ['blue-theme', 'green-theme', 'red-theme', 'yellow-theme', 'purple-theme', 'orange-theme'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    res.locals.bodyClass = randomTheme;

    next();
};