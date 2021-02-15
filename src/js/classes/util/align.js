class Align {
  static scaleToGameW(obj, per, game) {
    obj.displayWidth = game.config.width * per;
    obj.scaleY = obj.scaleX;
  }

  static center(obj) {
    obj.x = this.game.config.width / 2;
    obj.y = this.game.config.height / 2;
  }

  static centerH(obj) {
    obj.x = this.game.config.width / 2;
  }
  static centerV(obj) {
    obj.y = this.game.config.height / 2;
  }
}

export default Align;