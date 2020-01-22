var curCharacterIdx = -1;
var curQuizDiv = undefined;
var prevCharacterDivs = [];

var CHAR_SPACING = 20;

// these are the standard colors of the chinese support redux plugin
var TONE_COLORS = {
    'tone1': 'rgb(255, 0, 0)',
    'tone2': 'rgb(255, 165, 0)',
    'tone3': 'rgb(0, 128, 0)',
    'tone4': 'rgb(0, 0, 255)',
    'tone5': 'rgb(128, 128, 128)',
};


/**
 * Starts the quiz for the next character and moves all previous characters to the left
 */
function quizNextCharacter() {
    if (curQuizDiv !== undefined) {
        prevCharacterDivs.unshift(curQuizDiv);
    }
    if (curCharacterIdx < data.characters.length - 1) {
        curCharacterIdx++;
        curQuizDiv = document.createElement("div");
        document.getElementById(config.targetDiv).append(curQuizDiv);
        curQuizDiv.style['margin-left'] = -Math.floor(config.size / 2) + 'px';

        var character = data.characters[curCharacterIdx];
        var characterData = data.charactersData[curCharacterIdx];
        var toneColor = data.tones.length > 0 ? TONE_COLORS[data.tones[curCharacterIdx]] : '#555555';
        quizCharacter(character, characterData, toneColor, curQuizDiv);

        // if this is not the first character, we show a fade-in
        if (curCharacterIdx > 0) {
            curQuizDiv.style['margin-left'] = Math.floor(config.size / 2) + CHAR_SPACING + 'px';
            curQuizDiv.style.opacity = '0';

            // let webkit render the content before repositioning the new (new) character div. Otherwise the fade-in
            // animation is ignored
            setTimeout(function () {
                repositionDivs()
            }, 50);
        }
    }
}

/**
 * Repositions all character divs (thereby triggering css animations)
 */
function repositionDivs() {
    prevCharacterDivs.map(function (div, idx) {
        if (idx < 5) {
            div.style['margin-left'] = Math.floor(-config.size / 2 - (config.size + CHAR_SPACING) * (idx + 1)) + 'px';
        } else {
            div.style.display = 'none';
        }
    });

    curQuizDiv.style['margin-left'] = -Math.floor(config.size / 2) + 'px';
    curQuizDiv.style.opacity = '1';
}

/**
 * Creates and starts the HanziWriter quiz for a given character
 * @param character the character to quiz for
 * @param characterData stroke data
 * @param toneColor color of the tone
 * @param targetDiv div that should be used for rendering the quiz
 */
function quizCharacter(character, characterData, toneColor, targetDiv) {
    var writer = HanziWriter.create(targetDiv, character, {
        width: config.size,
        height: config.size,
        showCharacter: false,
        showOutline: false,
        highlightOnComplete: true,
        leniency: config.leniency,
        strokeColor: toneColor,
        showHintAfterMisses: config.showHintAfterMisses || Number.MAX_SAFE_INTEGER, // setting showHintAfterMisses to
        // false does not disable the feature
        padding: 0,
        charDataLoader: function (char, onComplete) {
            onComplete(characterData);
        },
        onComplete: function (data) {
            // wait for HanziWriter finish animation
            setTimeout(quizNextCharacter, 200);
        }
    });
    writer.quiz();
}


quizNextCharacter();