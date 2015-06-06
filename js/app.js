(function() {
  var CustomEditor = function(el) {
    this.el = el;

    this.widgetArea = this.el.find('.widget-area');
    this.urlInput   = this.el.find('[name=url]');
    this.content    = [];
    this.order      = 0;

    this.widgetArea.css({
      width: 500,
      height: 400
    })
    
    this.el.on('input', '.skin-control',   this._onSkinControlInput.bind(this))
    this.el.on('click', '[name=clear]',    this._onClearClicked.bind(this))
    this.el.on('click', '[name=add]',      this._onAddClicked.bind(this))
    this.el.on('click', '.content-list a', this._onRemoveClicked.bind(this))
  }

  CustomEditor.prototype.start = function() {
    // create a preview iframe to view and change the composition
    // the composition will load with the first preset set as skin
    this.preview = Widgetic.UI.composition(
      this.widgetArea[0], {
        widget_id: '5108dcefe599d12e6f000000'
      }
    );

    // mark that the skin has not been changed
    this.hasSkinChanges = false;

    /*
    // bind a click listener to a button to save the skin customization
    this.el.on('click', '[name=save]', function() {
      // Because we started the customization from a preset, 
      // `saveSkin` will save the modifications done using `changeSkin` as a new skin resource.
      // Subsequent saves would update the same skin resource.
      // Ideally you would only save a new skin if there were modifications done to the preset.
      if(this.hasSkinChanges) {
        this.preview.saveSkin();
      } else {
        // the saved composition resource will use the preset as skin
        this.preview.save();
      }
    }.bind(this))

    // after the skin is saved, you can save the composition
    this.preview.on(Widgetic.EVENTS.SKIN_SAVED, function(skin) {
      this.preview.save();
    }.bind(this))

    // after the composition is saved, you receive the composition resource
    this.preview.on(Widgetic.EVENTS.COMPOSITION_SAVED, function(composition) {
      console.log('composition saved as', composition.id)
    }.bind(this))
    */
  };

  CustomEditor.prototype._onSkinControlInput = function(ev) {
    if(!this.preview) return;

    // mark that the skin has been changed
    this.hasSkinChanges = true;

    var $input = $(ev.currentTarget);

    var skinChanges = {};
    skinChanges[$input.attr('name')] = $input.val();

    this.preview.changeSkin(skinChanges);
  }

  CustomEditor.prototype._onClearClicked = function() {
    this.preview.clearContent();
    this.content = [];
    this._renderContentList();
  }

  CustomEditor.prototype._onAddClicked = function() {
    var imageUrl = this.urlInput.val();
    if(!/^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+/.test(imageUrl)) {
      alert("Does not look like a valid url");
      return;
    }
    var newContent = {
      id: +new Date(),
      order: this.order++,
      image: imageUrl
    };
    this.content.push(newContent);
    this.preview.addContent(newContent);
    this._renderContentList();
  }

  CustomEditor.prototype._renderContentList = function() {
    var $list = this.el.find('.content-list')
    var html = this.content.reduce(function(acc, cur) {
      console.log(cur, acc);
      return acc + 
        '<li data-id="'+ cur.id +'">'+ cur.image.match(/(\/.+?)+$/)[1] +' <a href="#">Remove</a></li>';
    }, '')
    $list.html(html);
  }

  CustomEditor.prototype._onRemoveClicked = function(ev) {
    ev.preventDefault();
    var id = $(ev.currentTarget).parents('li').data('id')

    this.preview.removeContent({id: id});
    this.content = this.content.filter(function(item) {
      return item.id !== id;
    })
    this._renderContentList();
  };

  var App = function(el) {
    this.el = el;

    this.loginArea    = new LoginArea(this.el.find('.login-area'));
    this.customEditor = new CustomEditor(this.el.find('.custom-editor'));

    this.el.on('login-success', this._onLoginSuccess.bind(this))
  }

  App.prototype._onLoginSuccess = function() {
    this.el.removeClass('init');
    this.customEditor.start();
  };

  window.App = App;
}());