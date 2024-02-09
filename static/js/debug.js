let showEdges     = false;
let logMoves      = false;
let showCompCards = false;

let customStartCardCount;

if (showEdges) {
    $('.card-container-3d-wrapper').css('outline', '#00f solid 1px');
    $('.card-container-wrapper')   .css('outline', '#0ff solid 1px');
    $('.card-container')           .css('outline', '#0f0 solid 1px');
    $('.card-pile-container')      .css('outline', '#f00 solid 1px');
    $('.card-pile')                .css('outline', '#ff0 solid 1px');
    $('.comp-player-label')        .css('outline', '#f8f solid 1px')
        .children()                .css('outline', '#f0f solid 1px');
    $('.alert')                    .css('outline', '#f88 solid 1px');
    $('.wild-selection-hitbox')    .css('outline', '#80f solid 1px');
    $('.end').find('*')            .css('outline', '#f0f solid 1px');
}