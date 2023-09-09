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

    
}


module.exports = CommonPeople;