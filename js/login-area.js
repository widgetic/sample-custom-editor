(function(){
  var LoginArea = function(el) {
    this.el = el;

    var button = this.el.find('button');
    button.on('click', this.doLogin.bind(this, true))

    // do a background login
    this.doLogin(false);
  }

  LoginArea.prototype.doLogin = function(interactive) {
    return Widgetic.auth(interactive)
      .then(function() {
        this.el.trigger('login-success')
      }.bind(this))
      .fail(function() {
        this.el.trigger('login-fail')
      }.bind(this))
  };

  window.LoginArea = LoginArea;
}());