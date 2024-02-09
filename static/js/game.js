const playerHandDiv = $('.card-container#player');
const compLHandDiv  = $('.card-container#comp-l');
const compCHandDiv  = $('.card-container#comp-c');
const compRHandDiv  = $('.card-container#comp-r');
const discardDiv    = $('.card-pile#discard');
const drawDiv       = $('.card-pile#draw');
const wildPopupDiv  = $('.wild-popup');
const menuDiv       = $('.menu');
const endDiv        = $('.end');

let playerCards    = [];
let compLCards     = [];
let compCCards     = [];
let compRCards     = [];
let discardedCards = [];
let drawableCards  = [];

let playerCount;
let currentPlayer;
let reversed = false;
let wildHoveredColor = '';

$(window).on('resize', () => renderScene());

drawDiv.on('click', () => {
    if (currentPlayer !== 'player') return;
    let alreadyPlayable = someValidPlays(getHandCards('player'));
    drawCardThenRender('player').then(() => {
        if (alreadyPlayable || !someValidPlays(getHandCards('player'))) {
            stepPlayerThenRender(currentPlayer);
            if (currentPlayer !== 'player') compTurnThenNextPlayer(currentPlayer);
        }
    });
})

$('.menu .btn-container #2p div').append(
    renderMenuCard(-6, -6),
    renderMenuCard(-2,  6),
);

$('.menu .btn-container #3p div').append(
    renderMenuCard(-6.5, -6),
    renderMenuCard(-4  ,  0),
    renderMenuCard(-1.5,  6),
);

$('.menu .btn-container #4p div').append(
    renderMenuCard(-7, -6),
    renderMenuCard(-5, -2),
    renderMenuCard(-3,  2),
    renderMenuCard(-1,  6),
);

setPlayBtnHandler();
endDiv.hide();

$('.menu .btn-container .btn').on('click', function () {
    $(this)
        .animate({
            'outline-width': '0.75rem',
            'outline-offset': '-0.25rem',
            'outline-color': '#fff',
            'background-color': '#1118',
        }, 100, 'linear')
        .find('.card-body').addClass('card-back', 100, 'linear');
    $('.menu .btn-container .btn').not($(this))
        .animate({
        'outline-width': '0.25rem',
        'outline-offset': '0rem',
        'outline-color': '#6f6e87',
        'background-color': 'transparent',
    }, 100, 'linear')
        .find('.card-body').removeClass('card-back', 100, 'linear');
    playerCount = Number($(this).attr('id').charAt(0));
});

$('#restart-btn').on('click', () => {
    removeEndScreen();
    clearGame();
    renderScene();
    initGame();
});

$('#menu-btn').on('click', () => {
    $('.comp-player-label').css('opacity', 0);
    endDiv.find('*').hide('fade', {}, 500);
    console.log(menuDiv.width());
    endDiv.animate({
        'top': menuDiv.css('top'),
        'left': `${($('.game').width() - menuDiv.width())/2}px`,
        'width': `${menuDiv.width()}px`,
        'height': menuDiv.css('height'),
    }, 250, 'easeInOutCubic', removeEndScreen);
    setTimeout(() => menuDiv.show('fade', {}, 500), 250);
    setPlayBtnHandler();
    clearGame();
    renderScene();
});

$('.wild-selection-hitbox')
    .on('mouseenter', function () {
        wildHoveredColor = $(this).attr('id');
    })
    .on('mouseleave', () => wildHoveredColor = '');

const initGame = () => {
    ['comp-l', 'comp-c', 'comp-r'].forEach(plr => $(`#${plr}-name`).html(getPlayerName(plr)));
    (playerCount === 2 ? ['comp-c'] : playerCount === 3 ? ['comp-l', 'comp-r'] : ['comp-l', 'comp-c', 'comp-r'])
        .forEach(plr => $(`#${plr}-label`).animate({opacity: 1}, 500, 'linear'));
    initDrawPile().then(distributeCards).then(setFirstCard).then(() => {
        currentPlayer = 'player';
        renderHand('player', getHandDiv('player'), getHandCards('player'));
        renderPile('draw');
    });
};

const initDrawPile = () => {
    return new Promise((resolve, _) => {
        drawableCards = shuffleCards(getAllCards());
        renderPile('draw', 'fade', 250);
        setTimeout(resolve, 500);
    });
};

const distributeCards = () => {
    return new Promise((resolve, _) => {
        let startCardCount = customStartCardCount !== undefined ? customStartCardCount : 7;
        for (let i = 0; i < startCardCount; i++) {
            setTimeout(drawCardThenRender, i * 50, 'player');
            if (playerCount === 2) {
                setTimeout(drawCardThenRender, (i + 1 / 2) * 50, 'comp-c');
            } else if (playerCount === 3) {
                setTimeout(drawCardThenRender, (i + 1 / 3) * 50, 'comp-l');
                setTimeout(drawCardThenRender, (i + 2 / 3) * 50, 'comp-r');
            } else if (playerCount === 4) {
                setTimeout(drawCardThenRender, (i + 1 / 4) * 50, 'comp-l');
                setTimeout(drawCardThenRender, (i + 1 / 2) * 50, 'comp-c');
                setTimeout(drawCardThenRender, (i + 3 / 4) * 50, 'comp-r');
            }
        }
        setTimeout(resolve, startCardCount * 50);
    });
};

const setFirstCard = () => {
    return new Promise((resolve, _) => {
        discardedCards = drawableCards.splice(0, 1);
        while (isPowerCard(discardedCards[0])) {
            drawableCards.push(discardedCards.splice(0, 1)[0]);
            shuffleCards(drawableCards);
            discardedCards = drawableCards.splice(0, 1);
        }
        renderPile('draw');
        renderPile('discard', 'fade', 250);
        setTimeout(resolve, 250);
    });
};

const clearGame = () => {
    playerCards    = [];
    compLCards     = [];
    compCCards     = [];
    compRCards     = [];
    discardedCards = [];
    drawableCards  = [];
    currentPlayer  = undefined;
    reversed       = false;
}

const drawCardThenRender = (hand) => {
    return new Promise(async (resolve, _) => {
        let handCards = getHandCards(hand);
        handCards.push(drawableCards.splice(0, 1)[0]);
        if (logMoves) console.log('logMoves', `${hand} drew a card`);
        if (currentPlayer !== undefined) {
            let id = Date.now();
            $(`#${hand}-label`).append(
                $(`<div class="comp-plus-1" id="${id}">+1</div>`)
                    .css({'opacity': 1, 'bottom': '2.5rem'})
                    .animate({opacity: 0, bottom: '5rem'}, 500, 'easeOutCubic', () => {
                        $(`#${id}`).remove();
                    })
            );
        }
        renderHand(hand, getHandDiv(hand), handCards);
        renderPile('draw');
        if (drawableCards.length === 0) await refillDrawPile();
        resolve();
    });
};

const refillDrawPile = () => {
    return new Promise((resolve, _) => {
        let len = discardedCards.length;
        for (let i = 0; i < len; i++) {
            setTimeout(() => {
                drawableCards.push(discardedCards.splice(0, 1)[0]);
                renderPile('draw');
                renderPile('discard');
            }, i * 50);
        }
        setTimeout(resolve, len * 50);
    })
}

const playCardThenRender = (card, hand) => {
    return new Promise(async (resolve, reject) => {
        if (!validPlay(card, getDiscardTop())) return reject(`You can't play this card right now.`);
        let handCards = getHandCards(hand);
        let discardedCard = card;

        if (card.charAt(1) === 'w') {
            if (currentPlayer === 'player') {
                let color = await getWildSelection(card);
                if (color === '') return reject();
                discardedCard = card.charAt(0) + color + card.substring(2);
            } else {
                discardedCard =
                    card.charAt(0) + ['r', 'y', 'g', 'b'][Math.floor(Math.random() * 4)] + card.substring(2);
            }
        }

        handCards.splice(handCards.indexOf(card), 1);
        if (card.charAt(2) === 'r') {
            reversed = !reversed;
        } else if (card.charAt(2) === 's') {
            currentPlayer = nextPlayer(currentPlayer);
        } else if (card.charAt(2) === 't' || card.charAt(2) === 'f') {
            for (let i = 0; i < (card.charAt(2) === 't' ? 2 : 4); i++)
                setTimeout(drawCardThenRender, i * 100, nextPlayer(currentPlayer));
            currentPlayer = nextPlayer(currentPlayer);
        }

        if (logMoves) console.log('logMoves', `${hand} played ${discardedCard}`);
        discardedCards.push(discardedCard);
        renderHand(hand, getHandDiv(hand), handCards);
        renderPile('discard');
        resolve();
    });
};

const getWildSelection = async (card) => {
    let cardDiv = $(`#${card}`);
    let wildSelectedColor;

    await new Promise((resolve, _) => {
        wildPopupDiv
            .css('left', `calc(20% + ${cardDiv.css('left')} - 6rem)`)
            .css('display', 'flex')
            .animate({ opacity: 1 }, 500, 'linear');
        setTimeout(resolve, 500);
        $(window).on('resize', () => {
            wildPopupDiv.css('left', `calc(20% + ${cardDiv.css('left')} - 6rem)`);
        });
    });

    await new Promise((resolve, _) => {
        $(window).on('click', () => {
            $(window).off().on('resize', () => renderScene());
            wildPopupDiv.animate({ opacity: 0 }, 500, 'linear', () => wildPopupDiv.hide());
            wildSelectedColor = wildHoveredColor;
            resolve();
        });
    });

    return wildSelectedColor;
}

const validPlay = (playedCard, discardTop) => {
    // playable if same color
    if (playedCard.charAt(1) === discardTop.charAt(1)) return true;

    let playedRank = playedCard.charAt(2);
    let discardRank = discardTop.charAt(2);
    // playable if same rank
    if (playedRank === discardRank) return true;
    // wild card can always be played
    if (playedRank === 'f' || playedRank === 'w') return true;
    // playable if both plus cards
    return playedRank === 'f' && discardRank === 't' || playedRank === 't' && discardRank === 'f';
};

const nextPlayer = (current) => {
    if (current === undefined) return;
    switch (true) {
        case (playerCount === 2 && current === 'player'): return 'comp-c';
        case (playerCount === 2 && current === 'comp-c'): return 'player';

        case (playerCount === 3 && current === 'player'): return reversed ? 'comp-r' : 'comp-l';
        case (playerCount === 3 && current === 'comp-l'): return reversed ? 'player' : 'comp-r';
        case (playerCount === 3 && current === 'comp-r'): return reversed ? 'comp-l' : 'player';

        case (playerCount === 4 && current === 'player'): return reversed ? 'comp-r' : 'comp-l';
        case (playerCount === 4 && current === 'comp-l'): return reversed ? 'player' : 'comp-c';
        case (playerCount === 4 && current === 'comp-c'): return reversed ? 'comp-l' : 'comp-r';
        case (playerCount === 4 && current === 'comp-r'): return reversed ? 'comp-c' : 'player';
    }
};

const stepPlayerThenRender = (current) => {
    currentPlayer = nextPlayer(current);
    // render glows
    renderHand(current, getHandDiv(current), getHandCards(current));
    renderHand(currentPlayer, getHandDiv(currentPlayer), getHandCards(currentPlayer));
    renderPile('draw');
}

const compTurnThenNextPlayer = (compPlayer) => {
    let cards = getHandCards(compPlayer);
    let playedCard = false;
    let playedDrawnCard = false;

    setTimeout(async () => {
        for (let card of cards) {
            if (validPlay(card, getDiscardTop())) {
                await playCardThenRender(card, compPlayer);
                playedCard = true;
                break;
            }
        }

        if (!playedCard) {
            await drawCardThenRender(compPlayer);
            if (validPlay(cards[cards.length - 1], getDiscardTop())) {
                setTimeout(async () => {
                    await playCardThenRender(cards[cards.length - 1], compPlayer);
                }, 1000);
                playedDrawnCard = true;
            }
        }

        if (cards.length === 0) {
            renderEndScreen(compPlayer);
        } else {
            setTimeout(() => {
                stepPlayerThenRender(currentPlayer);
                if (currentPlayer !== 'player') compTurnThenNextPlayer(currentPlayer);
            }, playedDrawnCard ? 1000 : 0);
        }
    }, playedDrawnCard ? 2000 : 1000);
};