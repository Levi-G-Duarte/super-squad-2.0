// index.js
// Required modules
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

// Initialize Express application
const app = express();

// Define paths
const clientPath = path.join(__dirname, '..', 'client/src');
const dataPath = path.join(__dirname, 'data', 'superheroes.json');
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
        const { hero, origin, superPower } = req.body;

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
            foundHero.superPowers.push(superPower);
        } else {
            foundHero = { hero, origin, superPowers: [superPower] };
            heroes.push(foundHero);
        }

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
app.put('/update-user/:currentHero/:currentOrigin', async (req, res) => {
    try {
        const { currentHero, currentOrigin} = req.params;
        const { newHero, newOrigin} = req.body;
        console.log('Current user:', { currentHero, currentOrigin});
        console.log('New user data:', { newHero, newOrigin});
        const data = await fs.readFile(dataPath, 'utf8');
        if (data) {
            let heroes = JSON.parse(data);
            const userIndex = heroes.findIndex(h => h.hero === currentHero && h.origin === currentOrigin);
            console.log(userIndex);
            if (userIndex === -1) {
                alert("Hero Does Not Exist");
                return res.status(404).json({ message: "User not found" });
                
            }
            heroes[userIndex] = { ...heroes[userIndex], hero: newHero, origin: newOrigin };
            console.log(heroes);
            await fs.writeFile(dataPath, JSON.stringify(heroes, null, 2));
            res.status(200).json({ message: `You sent ${newHero} and ${newOrigin}` });
        }
    } catch (error) {
        alert('Hero Does Not Exist Bruv')
        console.error('Error updating user:', error);
        res.status(500).send('An error occurred while updating the user.');
    }
});

app.delete('/user/:hero/:origin', async (req, res) => {
    try {
        console.log(req.params)
        console.log(req.params.hero)
        console.log(req.params.origin)
        console.log(req.params.superPowers)
        //then cache returned name and email
        //as destructured variables from params
        const { hero, origin} = req.params;

        //intialize an empty array of 'users'
        let users = [];

        // try to read the users.json file and cache as data
        try {
            const data = await fs.readFile(dataPath, 'utf8')
            // parse the data
            users = JSON.parse(data);

        } catch (error) {
            return res.status(404).send('File data not found')
        }


        // cache the userIndex  based on a matching name and email
        const userIndex = users.findIndex(user => user.hero === hero && user.origin === origin)
        // handle a situation where the index does NOT exist
        if (userIndex === -1) {
            return res.status(404).send("Users is not correct");
        }
        // splice the users array with the indtended delete name and email

        users.splice(userIndex, 1);
        console.log(userIndex);
        console.log(users);
        try {
            await fs.writeFile(dataPath, JSON.stringify(users, null, 2))
        } catch (error) {
            console.error('Failed to write to database')
        }
        res.send('sucessfully deleted user')
        // send a success deleted message
    } catch (error) {
        alert('Hero Does Not Exist Bruv')
        console.error('this is not a banger')
    }
})
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})