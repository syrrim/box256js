

class ViewRender {

  constructor(obj) {
    this.width = obj.width;
    this.height = obj.height;
    this.wrapper = obj.wrapper;
    this.size = obj.cellSize;
    this.lines = obj.lines;

    this.bgColor = '#111';

    // Layer to put data
    this.activeLayer = null;


    var layerFactory = new LayersFactory({
        size: [this.width, this.height],
        wrap: this.wrapper
    });


    this.layers = {
      back: layerFactory.create('back', 1),
      data: layerFactory.create('data', 2),
    }

    this.loadImages();

  }

  onReady(fn) {
    this._onReadCallback = fn;
  }

  // Fill background
  drawBackground() {
    this.activeLayer = this.layers.back;
    this.activeLayer.fillAll(this.bgColor);

    this.drawScreen();
  }

  loadImages() {
    this.fontImage = new Image();
    this.fontImage.onload = () => {

      this.compileFonts();

      this.drawBackground();

      this.activeLayer = this.layers.data;

      // View Ready
      if (this._onReadCallback) {
        this._onReadCallback();
      }
    }
    this.fontImage.src = 'dos_font_black.png'
  }

  compileFonts() {
    this.fontColors = {
      white: this.fontImage,
      black: this.copyFont(this.bgColor),
      blue: this.copyFont('#384972'),
      lightblue: this.copyFont('#54aff7'), // 6baef1
      grey: this.copyFont('#5d5751'),
      green: this.copyFont('#3d8154'), //  4f7f58
      lightgreen: this.copyFont('#6ddd64'), //  8ada73
      red: this.copyFont('#e9415b'), //  d74f5e
      orange: this.copyFont('#9f5841'), //  965b46
      pink: this.copyFont('#ed85aa'),
      bordo: this.copyFont('#743253'), // jmp
      aqua: this.copyFont('#807999'), // add
      yellow: this.copyFont('#f6f073'), //

    };
  }

  copyFont(color) {
    var cnv = document.createElement('canvas');
    var w = this.fontImage.width;
    var h = this.fontImage.height;
    var layer = new Layer(cnv, w, h, 0, '');
    layer.cxt.drawImage(this.fontImage, 0, 0);
    // Invert
    layer.cxt.globalCompositeOperation = 'source-in';
    // Fill all clipped area exept char with color
    layer.set('fillStyle', color);
    layer.fillRect(0, 0, w, h);
    return layer.cnv;
  }

  drawTemplate() {
    this.activeLayer = this.layers.back;
    var lines = []
    for (var i=0;i<this.lines*4;i++) {
      if (i%4 == 0) {
        var n = i.toString(16).toUpperCase();
        if(i<16) {
          n = '0' + n;
        }
        lines.push(n);
      }
    }

    var y = 1;

    this._text('MEMORY', 21, y, 'green');

    this._text('[    ]', 6 , y, 'grey');
    this._text('SAVE', 7 , y, 'white');

    this._text('[    ]', 13 , y, 'grey');
    this._text('LOAD', 14 , y, 'white');

    y = 3;

    this._text(lines.join("\n"), 1, y, 'blue');

    this.activeLayer = this.layers.data;

    var nulls = []
    for (var i=0;i<this.lines;i++) {
      nulls.push('000 000 000 000')
    }
    this._text(nulls.join("\n"), 4, y, 'grey');

    var memory = []
    for (var i=0;i<this.lines;i++) {
      memory.push('00000000')
    }
    this._text(memory.join("\n"), 20 , y, 'green');

  }



  drawText(text, coords, color, bgcolor) {
    var size = this.size;
    var x = coords.x * size;
    var y = coords.y * size;

    this.font = this.fontColors[color];

    var dx = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] == "\n") {
        y += size;
        dx = 0;
        continue;
      }
      this.drawChar(text[i], x + dx * size, y, bgcolor);
      dx++;
    }
  }

  _text(text, x, y, color, bgcolor) {
    this.drawText(text,{x: x, y: y}, color, bgcolor);
  }

  drawChar(char, x, y, bgcolor) {
    const cxt = this.activeLayer;
    var size = this.size;
    var fontSize = 8;
    var code = char.charCodeAt();
    var cy = parseInt(code / 16, 10) * 9 + 1;
    var cx = (code % 16) * 9 + 1;

    // Clear
    cxt.set('fillStyle', bgcolor || this.bgColor);
    cxt.fillRect(x, y, size, size);

    // Draw char
    cxt.drawImage(this.font,
      cx, cy, fontSize, fontSize,
      x, y,
      size, size
    );
  }

  drawColor(coords, color) {
    var size = this.size;
    var x = coords.x * size;
    var y = coords.y * size;
    const cxt = this.activeLayer;
    // Clear
    cxt.set('fillStyle', color);
    cxt.fillRect(x, y, size, size);
  }

  drawSymbol(index, coords, color, bgcolor) {
    var size = this.size;
    var x = coords.x * size;
    var y = coords.y * size;
    this.font = this.fontColors[color];

    const cxt = this.activeLayer;
    var fontSize = 8;
    var code = index;
    var cy = parseInt(code / 16, 10) * 9 + 1;
    var cx = (code % 16) * 9 + 1;

    // Clear
    cxt.set('fillStyle', bgcolor || this.bgColor);
    cxt.fillRect(x, y, size, size);

    // Draw char
    cxt.drawImage(this.font,
      cx, cy, fontSize, fontSize,
      x, y,
      size, size
    );

  }

  moveLines(coords, height, width, direction, cut) {
    var cxt = this.activeLayer;
    var size = this.size;
    var x = coords.x * size;
    var y = coords.y * size;
    var w = width * size;
    var h = height *size;

    cxt.drawImage(cxt.cnv,
      x, y, w, h - (direction * size),
      x, y + direction * size, w, h - (direction * size));
  }

  drawScreen() {
    var cxt = this.activeLayer;
    cxt.save()
    var scrOffset = {
      y:3, x: 30
    }
    var size = this.size;
    var x = scrOffset.x * size;
    var y = scrOffset.y * size;

    var cell = 16;
    var count = 16;
    var num;
    cxt.set('fillStyle', '#444');

    this.size = 8;
    this.font = this.fontColors['white'];
    for (var i = 0; i <= count; i++) {
      cxt.fillRect(x + (i * cell), y, 1, 256);
      cxt.fillRect(x, y + (i * cell) , 256, 1);
    }

    var a1, a0;
    var xOff = x - 10;
    var yOff = y - 10;
    for (var i = 0; i < count; i++) {
      num = i.toString(16).toUpperCase();


      this.drawChar(num, xOff, y + 4 + i * 16);
      this.drawChar(num, x + 4 + i * 16, yOff);

    }
    cxt.restore();
    this.size = 16;
  }

}
