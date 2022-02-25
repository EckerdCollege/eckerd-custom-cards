module.exports = {
    "name": "Zoom Connections",
    "publisher": "Eckerd College",
    "configuration": {
        "client": [{
            "key": "cardhelper-url",
            "label": "Cardhelper Base URL",
            "type": "url",
            "required": true
        }],
    },
    "cards": [
        {
            "type": "ZoomScheduleCard",
            "source": "./src/cards/ZoomScheduleCard",
            "title": "Zoom Schedule",
            "displayCardType": "Zoom Schedule Card",
            "description": "Shows the user's upcoming Zoom meetings",
        },
    ],
    "page": {
        "source": "./src/page/index.jsx"
    }
}