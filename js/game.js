'use strict';
(function() {

  var cols = 7;
  var rows = 6;

  window.app = {} || window.app;

  // ties interaction
  app.Game = function() {
    // store the pieces created
    this.pieces = [];

    // cols first
    for (var i = 0; i < 7; ++i) {
      this.pieces.push([]);
    }

    this.curPiece = null;
  };

  app.Game.prototype = {

    init: function() {
      this.registerUIHandlers();
      this.newPiece('red');
    },

    newPiece: function() {
      var color = 'red';
      var c = 0;
      if (this.curPiece) {
        color = this.curPiece.color == color ? 'yellow':'red';
        c = this.curPiece.col;
      }

      var pieceContainer = document.getElementById('piece-container');
      var node = document.createElement('div');
      node.setAttribute('color', color);
      node.setAttribute('col', c);
      pieceContainer.appendChild(node);

      this.curPiece = {
        color: color,
        col: c,
        row: null,
        elem: node
      };
    },

    collectPieces: function(direction) {
      var j = rows - this.curPiece.row - 1;
      var i = this.curPiece.col;
      var color = this.curPiece.color;
      var count = 0;
      var out = [];

      while(1) {
        // 0 1 2
        // 3   4
        // 5 6 7
        switch (direction) {
          case 0:
            i--;
            j++;
            break;
          case 1:
            j++;
            break;
          case 2:
            i++;
            j++;
            break;
          case 3:
            i--;
            break;
          case 4:
            i++;
            break;
          case 5:
            i--;
            j--;
            break;
          case 6:
            j--;
            break;
          case 7:
            i++;
            j--;
            break;
        }

        count++;
        // we don't count more than 3 pieces away from the curPiece
        if (count >= 4) {
          break;
        }

        // break if out of the bound
        if (i < 0 || j < 0 || i >= cols || j >= rows) {
          break;
        }
        // break if there is no such piece
        if (!this.pieces[i][j]) {
          break;
        }
        // break if the color is different
        if (this.pieces[i][j].color != color) {
          break;
        }

        out.push(this.pieces[i][j]);
      }
      return out;
    },

    checkAllDir: function() {
      var color = this.curPiece.color;
      var pieces = [];

      // check row
      pieces = pieces.concat(this.collectPieces(3));
      pieces = pieces.concat(this.collectPieces(4));
      if (pieces.length >= 3) {
        return { color: color, pieces: pieces };
      }

      // check col
      pieces = [];
      pieces = pieces.concat(this.collectPieces(1));
      pieces = pieces.concat(this.collectPieces(6));
      if (pieces.length >= 3) {
        return { color: color, pieces: pieces };
      }
      
      // check diagonal 1
      pieces = [];
      pieces = pieces.concat(this.collectPieces(5));
      pieces = pieces.concat(this.collectPieces(2));
      if (pieces.length >= 3) {
        return { color: color, pieces: pieces };
      }
      
      // check diagonal 2
      pieces = [];
      pieces = pieces.concat(this.collectPieces(0));
      pieces = pieces.concat(this.collectPieces(7));
      if (pieces.length >= 3) {
        return { color: color, pieces: pieces };
      }
    },

    checkFull: function() {
      // check whether the board is full
      for (var i = 0; i < this.pieces.length; ++i) {
        if (this.pieces[i].length < rows) {
          return;
        }
      }

      // all reached full length
      showWinningText('Game Over');

      return true;
    },

    setPiece: function(row, col) {
      this.curPiece.elem.setAttribute('col', col);
      this.curPiece.elem.setAttribute('row', row);
      this.curPiece.col = col;
      this.curPiece.row = row;

      this.pieces[col].push(this.curPiece);
    },

    checkGameState: function() {
      var self = this;
      var winner = this.checkAllDir();
      if (winner) {
        showWinningText(winner.color + ' won');

        setTimeout(function() {
          // update the css for the winner 4 pieces
          for (var i = 0; i < winner.pieces.length; ++i) {
            winner.pieces[i].elem.classList.add('winner');
          }
          self.curPiece.elem.classList.add('winner');
        }, 500);
        return;
      }

      // check ending condition
      var gameover = this.checkFull();
      if (!gameover) {
        this.newPiece();
      }
    },

    registerUIHandlers: function() {
      var self = this;
      var elem = document.getElementById('board');
      elem.addEventListener('click', function(e) {
        if (e.target.hasAttribute('row') && e.target.hasAttribute('col')) {
          var c = parseInt(e.target.getAttribute('col'));
          var r = rows - self.pieces[c].length - 1;
          if (r < 0) {
            // clicked on a full col
            return;
          }

          self.setPiece(r, c);
          self.checkGameState();
        }
      });

      elem.addEventListener('mouseover', function(e) {
        if (e.target.hasAttribute('row') && e.target.hasAttribute('col')) {
          var c = parseInt(e.target.getAttribute('col'));

          self.curPiece.elem.setAttribute('col', c);
        }
      });
    }
  };

  function showWinningText(str) {
    var elem = document.getElementById('winningText');
    if (elem) {
      elem.textContent = str;
      elem.style.display = 'block';
      setTimeout(function() {
        elem.style.opacity = 1;
      }, 10);
    }
  }

})();
