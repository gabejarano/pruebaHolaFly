const fetch = require('node-fetch');
const { swPeople, swPlanet } = require('../db');
const { Planet } = require('../Planet');
const { peopleFactory } = require('../People')

//Init functions
const genericRequest = async (url, method, body, logging = false) => {
    let options = {
        method: method
    }
    if (body) {
        options.body = body;
    }
    const response = await fetch(url, options);
    const data = await response.json();
    if (logging) {
        console.log(data);
    }
    return data;
}



const getWeightOnPlanet = (mass, gravity) => {
    return mass * gravity;
}



//Functions to getWeightOnPlanetRandom
const parseGravity = function (gravity) {
    let options = gravity.split(',');
    let firstGravity = options[0].split(' ');
    let gravityValue = parseFloat(firstGravity);
    if (isNaN(gravityValue)) {
        return 'No se puede calcular la gravedad por falta de datos'
    }
    return gravityValue;
}

const parseMass = function (mass) {
    let massValue = parseFloat(mass)
    if (isNaN(massValue)) {
        return 'No se puede calcular la masa por falta de datos'
    }
    return massValue;
}

//General function
async function fetchDataFromSWAPI(url) {
    const response = await genericRequest(url, 'GET', null);
    if (response && response.name) {
        return response;
    }
    return null;
}


//Functions to getPlanetByID
async function fetchPlanetData(planetId) {
    const planetFromDB = await swPlanet.findOne({ where: { id: planetId } });
    if (planetFromDB) {
        return planetFromDB;
    }
    const swapiUrl = `https://swapi.dev/api/planets/${planetId}/`;
    const planetData = await fetchDataFromSWAPI(swapiUrl);
    return planetData || null;
}

async function createPlanetInstance(planetData) {
    const planet = new Planet(planetData.id);
    planet.init(planetData);
    return planet;
}


//Functions to getCharacterByID
async function fetchHomeworldData(homeworldUrl) {
    const match = homeworldUrl.match(/planets\/(\d+)\/$/);
    const homeworldData = await fetchDataFromSWAPI(homeworldUrl);

    if (homeworldData) {
        return {
            homeworld_name: homeworldData.name,
            homeworld_id: match[1]
        };
    }
    return null;
}

async function fetchCharacterData(characterId) {
    const characterFromDB = await swPeople.findOne({ where: { id: characterId } });
    if (characterFromDB) {
        return characterFromDB;
    }
    const swapiUrl = `https://swapi.dev/api/people/${characterId}/`;
    const characterData = await fetchDataFromSWAPI(swapiUrl);
    if (characterData) {
        characterData.homeworldData = await fetchHomeworldData(characterData.homeworld);
        return characterData;
    }
    return null;
}

async function createCharacterInstance(characterData, lang) {

    const people = await peopleFactory(characterData.id, lang, characterData);

    if (people) {
        await people.init(characterData);
        return people;
    }

    return null;
}

//Function to endpoint
const getCharacterByID = async function (characterId) {
    try {
        const characterData = await fetchCharacterData(characterId);
        if (characterData) {
            const character = await createCharacterInstance(characterData, '');
            return character;
        }
        return null;
    } catch (error) {
        throw error;
    }
}

//Function to endpoint
const getPlanetByID = async function (planetId) {
    try {
        const planetData = await fetchPlanetData(planetId);
        if (planetData) {
            const planet = await createPlanetInstance(planetData);
            return planet;
        }
        return null;
    } catch (error) {
        throw error;
    }
}

//Function to endpoint
const getWeightOnPlanetRandom = async function (numberPlanets, numberPeople) {
    try {
        const randomPlanetId = Math.floor(Math.random() * numberPlanets) + 1;
        const randomPeopleId = Math.floor(Math.random() * numberPeople) + 1;
        const planet = await getPlanetByID(randomPlanetId);
        const character = await getCharacterByID(randomPeopleId);
        if (!character || !planet) {
            const error = new Error('No existen suficientes datos para calcular el peso');
            error.code = 400;
            throw error;
        }
        if (character.getHomeworlId == randomPlanetId) {
            const error = Error('El planeta a consultar es el planeta natal del personaje');
            error.code = 400;
            throw error;
        }
        let mass = parseMass(character.getMass());
        let gravity = parseGravity(planet.getGravity());
        if ((typeof gravity === 'string') || (typeof mass === 'string')) {
            const error = new Error('No existe informacion suficiente de gravedad o masa para realizar el calculo');
            error.code = 400;
            throw error;
        }
        weight = getWeightOnPlanet(mass, gravity)
        return { weight, planetGravity: planet.getGravity(), characterMass: character.getMass() }
    } catch (error) {
        throw error
    }
}

module.exports = {
    getWeightOnPlanet,
    genericRequest,
    getCharacterByID,
    getPlanetByID,
    getWeightOnPlanetRandom
}