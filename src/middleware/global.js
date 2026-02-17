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
 * Express middleware that adds head asset management functionality to routes.
 * Provides arrays for storing CSS and JS assets with priority support.
 * 
 * Adds these methods to the response object:
 * - res.addStyle(css, priority) - Add CSS/link tags to head
 * - res.addScript(js, priority) - Add script tags 
 * 
 * Adds these functions to EJS templates via res.locals:
 * - renderStyles() - Outputs all CSS in priority order (high to low)
 * - renderScripts() - Outputs all JS in priority order (high to low)
 */
const setHeadAssetsFunctionality = (res) => {
    res.locals.styles = [];
    res.locals.scripts = [];

    res.addStyle = (css, priority = 0) => {
        res.locals.styles.push({ content: css, priority });
    };

    res.addScript = (js, priority = 0) => {
        res.locals.scripts.push({ content: js, priority });
    };

    // These functions will be available in EJS templates
    res.locals.renderStyles = () => {
        return res.locals.styles
            // Sort by priority: higher numbers load first
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };

    res.locals.renderScripts = () => {
        return res.locals.scripts
            // Sort by priority: higher numbers load first
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };
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

    // Convenience variable for UI state based on session state
    res.locals.isLoggedIn = false;
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
    }
    
    setHeadAssetsFunctionality(res);

    next();
};