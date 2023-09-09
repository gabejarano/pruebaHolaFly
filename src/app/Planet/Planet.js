class Planet {
    constructor() {
    }

    async init(planetData) {
        this.name = planetData.name;
        this.gravity = planetData.gravity;
    }

    getName() {
        return this.name;
    }

    getGravity() {
        return this.gravity;
    }

    //Functions to getWeightOnPlanetRandom
    parseGravity() {
        let options = this.gravity.split(',');
        let firstGravity = options[0].split(' ');
        let gravityValue = parseFloat(firstGravity);
        if (isNaN(gravityValue)) {
            return 'No se puede calcular la gravedad por falta de datos'
        }
        return gravityValue;
    }
}

module.exports = Planet;