const renderScene = () => {
    renderHands();
    renderPile('draw');
    renderPile('discard');
}

const renderHands = () => {
    renderHand('player', getHandDiv('player'), getHandCards('player'));
    renderHand('comp-l', getHandDiv('comp-l'), getHandCards('comp-l'));
    renderHand('comp-c', getHandDiv('comp-c'), getHandCards('comp-c'));
    renderHand('comp-r', getHandDiv('comp-r'), getHandCards('comp-r'));
}

const renderHand = (hand, handDiv, cards) => {
    let overlapAmt = hand === 'player' ? 24 : 60;
    let visibility = hand === 'player' ? 'v' : showCompCards ? 'v' : 'h';
    let cardCount  = cards.length;
    let handWidth  = handDiv.width();
    let cardsWidth = (96 - overlapAmt) * cardCount + overlapAmt;

    if (hand === 'player') cards.sort(compareCards);

    // determine position in div
    for (let i = 0; i < cardCount; i++) {
        let leftPx =
            cardsWidth > handWidth
                ? ((handWidth - 96) / (cardCount - 1)) * i
                : (handWidth - cardsWidth) / 2 + (96 - overlapAmt) * i;
        handDiv.append(renderCardDiv(cards[i], visibility, leftPx / handWidth * 100, 0).css('transform', ''));
    }

    // remove stray cards
    handDiv.children('.card-box').each(function () {
        if (cards.indexOf(`v${$(this).attr('id').substring(1)}`) === -1) $(`#${$(this).attr('id')}`).remove();
    })

    // add/remove glow depending on current player
    let glowDiv = handDiv.children('.card-container-glow').eq(0);
    if (currentPlayer === hand) {
        if (currentPlayer === 'player' && !someValidPlays(cards)) return;
        glowDiv
            .css({
                'width': cardsWidth > handWidth ? '100%' : `${cardsWidth / handWidth * 100}%`,
                'left': cardsWidth > handWidth ? '0' : `${(1 - cardsWidth / handWidth) * 50}%`,
            })
            .show('fade', {}, 500);
    } else {
        glowDiv.hide('fade', {}, 500);
    }

    // remove handlers
    if (hand === 'player') {
        handDiv.find('.card-box')
            .off()
            .on('mouseenter', function () {
                $(this).addClass('card-hover', 150, 'easeInOutCubic');
            })
            .on('mouseleave', function () {
                $(this).removeClass('card-hover', 150, 'easeInOutCubic');
            })
            .on('click', function () {
                if (currentPlayer !== 'player') return;
                playCardThenRender($(this).attr('id'), 'player').then(() => {
                    if (cards.length === 0) {
                        renderEndScreen('player');
                    } else {
                        stepPlayerThenRender(currentPlayer);
                        if (currentPlayer !== 'player') compTurnThenNextPlayer(currentPlayer);
                    }
                }, (reject) => {
                    if (reject !== undefined) {
                        renderAlert(reject);
                    } else {
                        console.log('rejected');
                    }
                });
            });
    }

    const cardSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28.3px" height="35px" fill="#fff" style="vertical-align: top"><path d="M24.7,5.3H23V3.6c0-2-1.6-3.6-3.6-3.6H3.6C1.6,0,0,1.6,0,3.6V26c0,2,1.6,3.6,3.6,3.6h1.7v1.7C5.3,33.4,7,35,9,35h15.7c2,0,3.6-1.6,3.6-3.6V9C28.3,7,26.7,5.3,24.7,5.3z M3.6,26.7C3.3,26.7,3,26.4,3,26V3.6C3,3.3,3.3,3,3.6,3h15.7C19.7,3,20,3.3,20,3.6v1.7H9C7,5.3,5.3,7,5.3,9v17.7H3.6z M25.3,31.4c0,0.3-0.3,0.6-0.6,0.6H9c-0.3,0-0.6-0.3-0.6-0.6v-1.7V9c0-0.3,0.3-0.6,0.6-0.6h14h1.7c0.3,0,0.6,0.3,0.6,0.6V31.4z"/></svg>'

    $(`#${hand}-card-count`).html(`${cardSvg} ${cardCount}`);
}

const renderPile = (pile, effect, time) => {
    let pileDiv = pile === 'draw' ? drawDiv : discardDiv;
    let cards = pile === 'draw' ? drawableCards : discardedCards;
    let visibility = pile === 'draw' ? 'h' : 'v';

    if (effect !== undefined && time !== undefined) pileDiv.hide();

    for (let i = 0; i < cards.length; i++) {
        let dx =  i * 0.121 * (pile === 'draw' ? -1 : 1);
        let dy = -i * 1.1;
        let dz =  i * 1.1;
        pileDiv.append(
            renderCardDiv(cards[i], visibility, 0)
                .css('transform', `translate3d(${dx}px, ${dy}px, ${dz}px)`)
        );
    }

    if (effect !== undefined && time !== undefined) pileDiv.show(effect, {}, time);

    // remove stray cards
    pileDiv.children('.card-box').each(function () {
        if (cards.indexOf(`v${$(this).attr('id').substring(1)}`) === -1) $(`#${$(this).attr('id')}`).remove();
    })

    let glowDiv = pileDiv.children('.card-pile-glow').eq(0);
    if (currentPlayer === 'player') {
        glowDiv.show('fade', {}, 500);
    } else {
        glowDiv.hide('fade', {}, 500);
    }
}

const renderCardDiv = (id, visibility, left) => {
    let div = $(`#${id}`);
    // if card exists and visibility stays the same, no changes
    // otherwise, recreate card with new id
    if (div.length && id.charAt(0) === visibility) return div.css('left', `${left}%`);
    return createCardDiv(visibility + id.substring(1), left);
}

const renderMenuCard = (translateX, rotate) => {
    return $('<div class="card-box"><div class="card-body card-wild"><div class="card-back-content"></div></div></div>')
        .css({
            'position': 'relative',
            'width': 0,
            'height': '8rem',
            'scale': 0.7,
            'transform': `translateX(${translateX * 0.7}rem)`,
            'rotate': `${rotate}deg`,
        });
}

const createCardDiv = (id, left) => {
    let div = $(`#${id}`);

    if (!div.length) {
        div = $('<div class="card-box"></div>')
            .attr('id', id)
            .html($('<div class="card-body"></div>'));
    }

    div.css('left', `${left}%`);

    let cardBody = div.children().eq(0);

    // if card is hidden, display back
    if (id.charAt(0) === 'h') {
        cardBody.addClass('card-back');
        cardBody.html('<div class="card-back-content"></div>');
        return div;
    }

    let colorClass;
    switch (id.charAt(1)) {
        case 'r': colorClass = 'card-red'   ; break;
        case 'y': colorClass = 'card-yellow'; break;
        case 'g': colorClass = 'card-green' ; break;
        case 'b': colorClass = 'card-blue'  ; break;
        default : colorClass = 'card-wild'  ;
    }
    cardBody.addClass(colorClass);

    let contentDiv = $('<div class="card-content"></div>');
    let cornerDiv = $('<div class="card-corner"></div>');

    let rank = id.charAt(2);
    switch (rank) {
        case 's':
            contentDiv.append($('<div class="card-skip-content"></div>').addClass(colorClass));
            cornerDiv.addClass('card-skip-corner');
            break;
        case 'r':
            contentDiv.append($('<div class="card-reverse-content"></div>').addClass(colorClass));
            cornerDiv.addClass('card-reverse-corner');
            break;
        case 't':
            contentDiv.addClass('card-small-content').html('+2');
            cornerDiv.addClass('card-small-corner').html('+2');
            break;
        case 'f':
            contentDiv.addClass('card-small-content').html('+4');
            cornerDiv.addClass('card-small-corner').html('+4');
            break;
        case 'w':
            contentDiv
                .append($('<div class="card-wild-content-nw"></div>'))
                .append($('<div class="card-wild-content-ne"></div>'))
                .append($('<div class="card-wild-content-sw"></div>'))
                .append($('<div class="card-wild-content-se"></div>'));
            cornerDiv
                .addClass('card-wild-corner')
                .append($('<div class="card-wild-corner-nw"></div>'))
                .append($('<div class="card-wild-corner-ne"></div>'))
                .append($('<div class="card-wild-corner-sw"></div>'))
                .append($('<div class="card-wild-corner-se"></div>'));
            break;
        default:
            contentDiv.html(rank);
            cornerDiv.html(rank);
    }

    cardBody.append(contentDiv, cornerDiv);
    return div;
};

const renderAlert = (alert) => {
    let alertDiv = $('.alert');
    alertDiv.stop(true, true).html($(`<div>${alert}</div>`)).css('display', 'flex');
    setTimeout(() => alertDiv.hide('fade', {}, 1000), 1000);
}

const renderEndScreen = (winner) => {
    setTimeout(() => {
        $({ blurRadius: 0 }).animate(
            { blurRadius: 1 },
            {
                'duration': 500,
                'easing': 'easeOutCubic',
                'step': function () {
                    $('.game').css('filter', `blur(${this.blurRadius}rem)`);
                },
                'callback': function () {
                    $('.game').css('filter', 'blur(1rem)');
                }
            }
        );
        let winText = winner === 'player' ? 'win! 🎉' : 'won.';
        $('.end .title').html(`${getPlayerName(winner)} ${winText}`);
        $('.end').show('fade', {}, 500);
    }, 500);
};

const removeEndScreen = () => {
    $({ blurRadius: 1 }).animate(
        { blurRadius: 0 },
        {
            'duration': 500,
            'easing': 'easeOutCubic',
            'step': function () {
                $('.game').css('filter', `blur(${this.blurRadius}rem)`);
            },
            'callback': function () {
                $('.game').css('filter', 'blur(0rem)');
            }
        }
    );
    $('.end').hide('fade', {}, 500);
};