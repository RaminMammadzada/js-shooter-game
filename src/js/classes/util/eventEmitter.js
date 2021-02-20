import Phaser from 'phaser';

class EventEmitter extends Phaser.Events.EventEmitter {
}

export default (new EventEmitter());