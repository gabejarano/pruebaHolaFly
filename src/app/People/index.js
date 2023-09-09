const WookieePeople = require('./wookieePeople');
const CommonPeople = require('./commonPeople');

const peopleFactory = async (id, lang, characterData) => {
    let people = null;
    if (lang == 'wookiee'){
        people = new WookieePeople(id);
    } else {
        people = new CommonPeople(id);
    }
    await people.init(characterData);
    return people;
}

module.exports = { peopleFactory }