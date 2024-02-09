const getHandDiv = (hand) => {
    switch (hand) {
        case 'player': return playerHandDiv;
        case 'comp-l': return compLHandDiv;
        case 'comp-c': return compCHandDiv;
        case 'comp-r': return compRHandDiv;
    }
};

const getHandCards = (hand) => {
    switch (hand) {
        case 'player': return playerCards;
        case 'comp-l': return compLCards;
        case 'comp-c': return compCCards;
        case 'comp-r': return compRCards;
    }
};

const getPlayerName = (player) => {
    switch (true) {
        case (playerCount === 2 && player === 'comp-c'): return 'COMP';

        case (playerCount === 3 && player === 'comp-l'): return 'COMP 1';
        case (playerCount === 3 && player === 'comp-r'): return 'COMP 2';

        case (playerCount === 4 && player === 'comp-l'): return 'COMP 1';
        case (playerCount === 4 && player === 'comp-c'): return 'COMP 2';
        case (playerCount === 4 && player === 'comp-r'): return 'COMP 3';

        case (player === 'player'): return 'You';
        default: return '';
    }
}

const getAllCards = () => {
    let cards = [];

    ['r', 'y', 'g', 'b'].forEach((color) => cards.push(`v${color}0`));

    ['t', 's', 'r'].forEach((rank) =>
        ['r', 'y', 'g', 'b'].forEach((color) => ['a', 'b'].forEach((idx) => cards.push(`v${color}${rank}${idx}`)))
    );

    for (let rank = 1; rank <= 9; rank++) {
        ['r', 'y', 'g', 'b'].forEach((color) => ['a', 'b'].forEach((idx) => cards.push(`v${color}${rank}${idx}`)));
    }

    ['f', 'w'].forEach((rank) => ['a', 'b', 'c', 'd'].forEach((idx) => cards.push(`vw${rank}${idx}`)));

    return cards;
};

const getDiscardTop = () => discardedCards[discardedCards.length - 1]

const someValidPlays = (cards) => {
    for (let card of cards) if (validPlay(card, getDiscardTop())) return true;
    return false;
}

const isPowerCard = (card) => {
    let rank = card.charAt(2);
    return rank === 'w' || rank === 'f' || rank === 't' || rank === 's' || rank === 'r';
};

const compareCards = (left, right) => {
    const colors = ['w', 'r', 'y', 'g', 'b'];
    const ranks = ['w', 'f', 't', 's', 'r', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // compare colors
    if (colors.indexOf(left.charAt(1)) > colors.indexOf(right.charAt(1))) return 1;
    if (colors.indexOf(left.charAt(1)) < colors.indexOf(right.charAt(1))) return -1;

    // compare ranks
    if (ranks.indexOf(left.charAt(2)) > ranks.indexOf(right.charAt(2))) return 1;
    if (ranks.indexOf(left.charAt(2)) < ranks.indexOf(right.charAt(2))) return -1;

    return 0;
};

const shuffleCards = (array) => {
    let i;
    let j = array.length;
    while (j) {
        i = Math.floor(Math.random() * j--);
        [array[j], array[i]] = [array[i], array[j]];
    }
    return array;
};

const setPlayBtnHandler = () => {
    $('#play-btn').on('click', () => {
        if (playerCount === undefined) {
            renderAlert('Select a player mode.');
            return;
        }
        $('.menu').hide('fade', {}, 500);
        initGame();
        $('#play-btn').off();
    });
}