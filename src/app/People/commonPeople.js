const AbstractPeople = require('./abstractPeople')

class CommonPeople extends AbstractPeople {
    constructor(id) {
        super(id); 
    }

    async init(characterData) {
        // Inicializa los atributos utilizando los datos de characterData.
        this.name = characterData.name;
        this.mass = characterData.mass;
        this.height = characterData.height;
        this.homeworldName = characterData.homeworld_name || characterData.homeworldData.homeworld_name ;
        this.homeworldId = characterData.homeworld_id || characterData.homeworldData.homeworld_id;
    }

  

    parseMass() {
        let massValue = parseFloat(this.mass)
        if (isNaN(massValue)) {
            return 'No se puede calcular la masa por falta de datos'
        }
        return massValue;
    }

    getWeightOnPlanet(planet) {
        if (this.getHomeworlId == planet.id) {
            const error = Error('El planeta a consultar es el planeta natal del personaje');
            error.code = 400;
            throw error;
        }
        let mass = this.parseMass();
        let gravity = planet.parseGravity();
        if ((typeof gravity === 'string') || (typeof mass === 'string')) {
            const error = new Error('No existe informacion suficiente de gravedad o masa para realizar el calculo');
            error.code = 400;
            throw error;
        }
        let weight = mass * gravity
        return { weight, planetGravity: planet.getGravity(), characterMass: this.mass }
    }
}


module.exports = CommonPeople;