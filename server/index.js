// index.js
// Required modules
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

// Initialize Express application
const app = express();

// Define paths
const clientPath = path.join(__dirname, '..', 'client/src');
const dataPath = path.join(__dirname, 'data', 'users.json');
const serverPublic = path.join(__dirname, 'public');
// Middleware setup
app.use(express.static(clientPath)); // Serve static files from client directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

// Routes

// Home route
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: clientPath });
});

app.get('/users', async (req, res) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        const hero = JSON.parse(data);
        if (!hero) {
            throw new Error("Error no users available");
        }
        res.status(200).json(hero);
    } catch (error) {
        console.error("Problem getting users" + error.message);
        res.status(500).json({ error: "Problem reading users" });
    }
});

// Form route
app.get('/form', (req, res) => {
    res.sendFile('pages/form.html', { root: serverPublic });
});

// Form submission route
app.post('/submit-form', async (req, res) => {
    try {
        const { hero, origin, superPowers } = req.body;


        // Read existing users from file
        let heroes = [];
        try {
            const data = await fs.readFile(dataPath, 'utf8');
            heroes = JSON.parse(data);
        } catch (error) {
            // If file doesn't exist or is empty, start with an empty array
            console.error('Error reading user data:', error);
            heroes = [];
            console.log('error')
        }

        // Find or create user
        let foundHero = heroes.find(h => h.hero === hero && h.origin === origin);
        if (foundHero) {
            foundHero.superPower.push(superPowers);
        } else {
            foundHero = { hero, origin, superPower: [superPowers] };
            heroes.push(foundHero);
        }
        // let foundHero = users.find(user => user.hero === hero && user.origin === origin);

        // if (foundHero) {
        //     if (!Array.isArray(foundHero.superPower)) {
        //         foundHero.superPower = [];
        //     }
        //     foundHero.superPower.push(superPowers);
        // } else {
        //     users.push({ hero, origin, superPower: [superPowers] });
        // }

        // Save updated users
        await fs.writeFile(dataPath, JSON.stringify(heroes, null, 2));
        console.log(heroes)
        res.redirect('/form');
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).send('An error occurred while processing your submission.');
    
    }
});

// Update user route (currently just logs and sends a response)
app.put('/update-user/:currentHero/:currentOrigin/:currentPowers', async (req, res) => {
    try {
        const { currentHero, currentOrigin, currentPowers } = req.params;
        const { newHero, newOrigin, newPowers } = req.body;
        console.log('Current user:', { currentHero, currentOrigin, currentPowers });
        console.log('New user data:', { newHero,  newOrigin, newPowers });
        const data = await fs.readFile(dataPath, 'utf8');
        if (data) {
            let heroes = JSON.parse(data);
            const userIndex = heroes.findIndex(h => h.hero === currentHero && h.origin === currentOrigin && h.superPowers.includes(currentPowers));
            console.log(userIndex);
            if (userIndex === -1) {
                return res.status(404).json({ message: "User not found" })
            }
            heroes[userIndex] = { ...heroes[userIndex], hero: newHero, origin: newOrigin, superPower: newPowers};
            console.log(heroes);
            await fs.writeFile(dataPath, JSON.stringify(heroes, null, 2));
            res.status(200).json({ message: `You sent ${newHero} and ${newOrigin} and ${newPowers}` });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('An error occurred while updating the user.');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});