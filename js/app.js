(function() {
  var CustomEditor = function(el) {
    this.el = el;

    // initialize the component
    this.widgetArea = this.el.find('.widget-area');
    this.urlInput   = this.el.find('[name=url]');
    this.content    = [];
    this.order      = 0;

    // bind the event handlers
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
    // check if the preview has been created
    if(!this.preview) return;

    // mark that the skin has been changed
    this.hasSkinChanges = true;

    var $input = $(ev.currentTarget);

    // create the skinChanges object
    // @example: { backgroundColor: '#ffaaff' }
    var skinChanges = {};
    skinChanges[$input.attr('name')] = $input.val();

    // apply the changes
    this.preview.changeSkin(skinChanges);
  }

  CustomEditor.prototype._onClearClicked = function() {
    // empty the preview widget
    this.preview.clearContent();

    // update the custom editor's list of content items
    this.content = [];
    this._renderContentList();
  }

  CustomEditor.prototype._onAddClicked = function() {
    // validate the input
    var imageUrl = this.urlInput.val();
    if(!/^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+/.test(imageUrl)) {
      alert("Does not look like a valid url");
      return;
    }

    // create a content object according to the content schema
    // @see http://docs.widgetic.com/#the-content-meta
    var newContent = {
      id: +new Date(),     // set a unique id to be able to reference it later
      order: this.order++, // specify the order in wich the content items are displayed
      image: imageUrl      // set the mainAttribute
      // add the rest of the content properties
    };
    
    // add the content to the widget
    this.preview.addContent(newContent);

    // update the custom editors' list of content items
    this.content.push(newContent);
    this._renderContentList();
  }

  CustomEditor.prototype._onRemoveClicked = function(ev) {
    ev.preventDefault();

    // get the id of the content
    var id = $(ev.currentTarget).parents('li').data('id')

    // remove the content from the preview referencing it by id
    this.preview.removeContent({id: id});

    // update the custom editors' list of content items    
    this.content = this.content.filter(function(item) {
      return item.id !== id;
    })
    this._renderContentList();
  };

  CustomEditor.prototype._renderContentList = function() {
    var $list = this.el.find('.content-list')
    var html = this.content.reduce(function(acc, cur) {
      return acc + 
        '<li data-id="'+ cur.id +'">'+ 
        cur.image.match(/(\/.+?)+$/)[1] +
        ' <a href="#">Remove</a></li>';
    }, '')
    $list.html(html);
  }

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