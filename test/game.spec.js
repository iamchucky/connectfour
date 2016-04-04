var expect = require('expect.js');
var sinon = require('sinon');
var jsdom = require('mocha-jsdom');
var fs = require('fs');
var page = fs.readFileSync('index.html', 'utf8');
var gameFile = fs.readFileSync('js/game.js', 'utf8');

describe('Game', function() {
  jsdom({ html: page, src: [gameFile] });

  function click(el){
    var ev = document.createEvent("MouseEvent");
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        0, 0, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
  }

  var game;
  beforeEach(function() {
    game = new window.app.Game();
  });

  afterEach(function() {
    var container = document.getElementById('piece-container');
    container.innerHTML = '';

    var elem = document.getElementById('board');
    elem.parentNode.replaceChild(elem.cloneNode(true), elem);
  });

  it('should have empty pieces of length 7 from constructor', function() {
    expect(game.pieces).to.have.length(7);

    for (var i = 0; i < 7; ++i) {
      expect(game.pieces[i]).to.be.an('array').length(0);
    }
  });

  it('should init with red piece', function() {
    expect(game.curPiece).to.be(null);

    game.init();
    expect(game.curPiece.color).to.be('red');

    var container = document.getElementById('piece-container');
    expect(container.children).to.have.length(1);
    expect(container.children[0].getAttribute('color')).to.be('red');
    expect(container.children[0]).to.equal(game.curPiece.elem);
  });

  it('on click should invoke setPiece and checkGameState', function() {
    var spy = {
      setPiece: sinon.spy(game, 'setPiece'),
      checkGameState: sinon.spy(game, 'checkGameState')
    };

    var container = document.getElementById('piece-container');
    game.init();
    expect(container.children).to.have.length(1);

    var elem = document.querySelector('#board > .row > .cell[row="0"][col="0"]');
    click(elem);

    expect(container.children).to.have.length(2);
    sinon.assert.calledOnce(spy.setPiece);
    sinon.assert.calledWith(spy.setPiece, 5, 0);
    sinon.assert.calledOnce(spy.checkGameState);
    expect(game.curPiece.color).to.be('yellow');

    click(elem);

    expect(container.children).to.have.length(3);
    sinon.assert.calledTwice(spy.setPiece);
    sinon.assert.calledWith(spy.setPiece, 4, 0);
    sinon.assert.calledTwice(spy.checkGameState);
    expect(game.curPiece.color).to.be('red');
  });

  describe('checkAllDir', function() {

    var rows = 6 - 1;
    var r = { color: 'red' };
    var y = { color: 'yellow' };
    beforeEach(function() {
      game.init();
    });

    it('should check winner horizontally', function() {
      var actual = game.checkAllDir();
      expect(actual).to.be(undefined);

      game.curPiece = {
        color: 'red',
        col: 0,
        row: rows - 0,
      };
      game.pieces = [ 
        [],
        [ r ],
        [ r ],
        [ r ],
        [],
        [],
        []
      ]

      actual = game.checkAllDir();
      expect(actual.color).to.be('red');
    });

    it('should check winner vertically', function() {
      var actual = game.checkAllDir();
      expect(actual).to.be(undefined);

      game.curPiece = {
        color: 'red',
        col: 1,
        row: rows - 3,
      };
      game.pieces = [ 
        [],
        [ r, r, r ],
        [],
        [],
        [],
        [],
        []
      ]

      actual = game.checkAllDir();
      expect(actual.color).to.be('red');
    });

    it('should check winner forward diagonally', function() {
      var actual = game.checkAllDir();
      expect(actual).to.be(undefined);

      game.curPiece = {
        color: 'yellow',
        col: 4,
        row: rows - 3,
      };
      game.pieces = [ 
        [],
        [ y ],
        [ r, y ],
        [ r, y, y ],
        [ y, r, r ],
        [],
        []
      ]

      actual = game.checkAllDir();
      expect(actual.color).to.be('yellow');
    });

    it('should check winner backward diagonally', function() {
      var actual = game.checkAllDir();
      expect(actual).to.be(undefined);

      game.curPiece = {
        color: 'red',
        col: 1,
        row: rows - 3,
      };
      game.pieces = [ 
        [],
        [ y, r, y ],
        [ r, y, r ],
        [ r, r, y ],
        [ r, r, y ],
        [],
        []
      ]

      actual = game.checkAllDir();
      expect(actual.color).to.be('red');
    });
  });

  it('should check game over state correctly', function() {
    game.init();

    for (var i = 0; i < 7; ++i) {
      var elem = document.querySelector('#board > .row > .cell[row="0"][col="'+i+'"]');
      // loop more than actual row count to test more clicks
      for (var j = 0; j < 9; ++j) {
        click(elem);
      }
    }
    for (var i = 0; i < 7; ++i) {
      expect(game.pieces[i]).to.be.an('array').length(6);
    }

    expect(game.checkFull()).to.be(true);
  });

});
