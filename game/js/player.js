var Player = function() {
	this.div = $('<div id="player" class="walking"></div>');
	$board .append(this.div);
	this.name = "Michael";
	this.position = new ElementPosition(50, 300, this.div.width(), this.div.height());
	this.jumping = { limit : 0, velocity : 0 };
	this.running = { left : 0, right : 0 };
	this.deathhold = 0;
	this.standing = true;
	this.animation = null;
	this.update = function (seconds) {
		this.input (seconds);
		this.move(seconds);
		this.fall(seconds);
		this.die(seconds);
		render(this, seconds);
	};
	this.input = function(seconds) {
		if (jump.pressed) {
			if (!this.jumping.velocity && this.standing) {
				this.jumping.landing = false;
				this.jumping.velocity = Math.max(0.75, Math.abs(this.running.right - this.running.left));
			}
		} else if (this.jumping.velocity > 0.5) {
			this.jumping.velocity = 0.5;
		}
		if (right.pressed) {
			if (!this.animation || !this.animation.type == 'running') {
				this.position.orientation = 'right';
				this.animation = new Animation('running', 2, 0.25, true);
			}
			if (this.running.right < 1.0) {
				this.running.right += seconds;
			}
		} else if (this.running.right > 0.0) {
			this.running.right -= seconds * 4;
			if (this.running.right < 0.0) {
				this.running.right = 0;
				this.animation = null;
			}
		}
		if (left.pressed) {
			if (!this.animation || !this.animation.type == 'running') {
				this.position.orientation = 'left';
				this.animation = new Animation('running', 2, 0.25, true);
			}
			if (this.running.left < 1.0) {
				this.running.left += seconds;;
			}
		} else if (this.running.left > 0.0) {
			this.running.left -= seconds * 4;
			if (this.running.left < 0.0) {
				this.running.left = 0;
				this.animation = null;
			}
		}
	}
	this.move = function(seconds) {
		if (this.running.right || this.running.left) {
			var velocity = (this.running.right - this.running.left) * Settings.movement_speed * seconds;
			var offset = 0;
			if (velocity > 0) {
				offset = this.position.width;
			}
			var moved = false;
			do {
				var nextX = this.position.x + velocity + offset;
				if (nextX < 0) {
					nextX = 0;
				}
				var nextY = $board.height() - this.position.y - 1;
				var $next = $(document.elementFromPoint(nextX, nextY));
				var isSolid = false;
				if ($next.is(".solid")) {
					isSolid = true;
				} else {
					$next = $(document.elementFromPoint(nextX, nextY - 30));
					if ($next.is(".solid")) {
						isSolid = true;
					}
				}
				if (isSolid) {
					if (velocity > 0 ) {
						velocity -= 1 * seconds;
					} else{
						velocity += 1 * seconds;
					}
				} else {
					this.position.x += velocity;
					moved = true;
				}
			} while (!moved && velocity > 0);
		}
	};
	this.fall = function(seconds) {
		var velocity;
		if (this.jumping.velocity) {
			if (!this.jumping.limit) {
				this.jumping.limit = this.position.y + Settings.jump_height;
			} else if (this.jumping.limit <= this.position.y) {
				this.jumping.velocity = 0.0;
			}
			velocity =  (this.jumping.velocity * Settings.jump_speed * seconds) * -1;
			this.jumping.velocity -= (1.5 * seconds);
			if (this.jumping.velocity < 0.0) {
				this.jumping.velocity = 0.0;
			}
		} else {
			velocity =  Settings.falling_speed * seconds;
		}
		var offset = this.position.width;
		var moved = false;
		var hitGround = false;
		do {
			var offset = 0;
			var bottomY = $board.height() - this.position.y + velocity - offset;
			var offsetX = this.position.width;
			var isSolid = false;
			var modifier;
			var offsetY = 0;
			if (velocity < 0.0) {
				offsetY = this.position.height;
				modifier = 1;
			} else {
				modifier = -1;
			}
			var $next = $(document.elementFromPoint(this.position.x, bottomY - offsetY));
			if ($next.is(".solid")) {
				isSolid = true;
			} else {
				$next = $(document.elementFromPoint(this.position.x + offsetX, bottomY - offsetY));
				if ($next.is(".solid")) {
					isSolid = true;
				}
			}			
			
			if (isSolid) {
				velocity += 1 * modifier;
				if (modifier == -1) {
					hitGround = true;
				}
			} else {
				this.position.y -= velocity;
				moved = true;
			}
		} while (!moved && velocity > 0);
		if (hitGround) {
			this.standing = true;
		} else {
			this.standing = false;
		}
	};
	this.die = function(seconds) {
		if (this.position.y < 0) {
			this.deathhold += seconds;
		}
		if (this.deathhold >= 1.0) {
			gameOver();
		}
	};
};