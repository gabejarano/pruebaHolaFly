
const _isWookieeFormat = (req) => {
    if (req.query.format && req.query.format == 'wookiee') {
        return true;
    }
    return false;
}


const applySwapiEndpoints = (server, app) => {

    server.get('/hfswapi/test', async (req, res) => {
        const data = await app.swapiFunctions.genericRequest('https://swapi.dev/api/', 'GET', null, true);
        res.send(data);
    });

    server.get('/hfswapi/getPeople/:id', async (req, res) => {
        const characterId = req.params.id;
        try {
            const character = await app.swapiFunctions.getCharacterByID(characterId);
            if (!character) {
                return res.sendStatus(404);
            }
            return res.send(character);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error'); // Devuelve un código de estado 500 en caso de error.
        }
    });

    server.get('/hfswapi/getPlanet/:id', async (req, res) => {
        const planetId = req.params.id;
        try {
            const planet = await app.swapiFunctions.getPlanetByID(planetId);
            if (!planet) {
                return res.sendStatus(404);
            }
            return res.send(planet);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error'); // Devuelve un código de estado 500 en caso de error.
        }
    });

    server.get('/hfswapi/getWeightOnPlanetRandom', async (req, res) => {
        try {
            const { weight, planetGravity, characterMass } = await app.swapiFunctions.getWeightOnPlanetRandom(app.constants.COUNT_PLANETS, app.constants.COUNT_PEOPLE);
            res.send({ weight, planetGravity, characterMass })
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    server.get('/hfswapi/getLogs', async (req, res) => {
        const data = await app.db.logging.findAll();
        res.send(data);
    });

}

module.exports = applySwapiEndpoints;