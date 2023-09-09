const AbstractPeople = require('./abstractPeople')

class WookieePeople extends AbstractPeople {
    constructor(id) {
        super(id); 
    }

    async init(characterData) {
        this.name = characterData.whrascwo; 
        this.mass = characterData.scracc; 
        this.height = characterData.acwoahrracao; 
        this.homeworldName = characterData.homeworld_name || characterData.homeworldData.homeworld_name; 
        this.homeworldId = characterData.homeworld_id || characterData.homeworldData.homeworld_id; 
    }
}




module.exports = WookieePeople;