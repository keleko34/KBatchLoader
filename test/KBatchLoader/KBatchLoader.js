define([],function(){
  function CreateKBatchLoader()
  {
    var _types = {},
        _fetchListeners = [],
        _onFetch = function(f)
        {
          for(var x=0,len=_fetchListeners.length;x<len;x++)
          {
            if(f._stopPropogation === true) return f._preventDefault;

            _fetchListeners[x](f);
          }
          return f._preventDefault;
        }

    function fetchObject(file,type,loaded,element,content)
    {
      this.preventDefault = function()
      {
        this._preventDefault = true;
      }
      this.stopPropogation = function()
      {
        this._stopPropogation = true;
      }
      this.url = file;
      this.loaded = loaded;
      this.element = element;
      this.content = content;
      this.type = type;
    }

    function css(file,fn)
    {
      function createNode(src,fn)
      {
        var node = document.createElement('link');
        node.rel = "stylesheet";
        node.href = src;
        node.type = "text\/css";
        node.onload = fn;
        return node;
      }

      return document.head.appendChild(createNode(file,fn));
    }

    function js(file,fn)
    {
      function createNode(src,fn)
      {
        var node = document.createElement('script');
        node.type = 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        node.src = src;
        node.onload = fn;
        return node;
      }

      return document.head.appendChild(createNode(file,fn));
    }

    function KBatchLoader()
    {
      KBatchLoader.addFileType('js',js)
      .addFileType('css',css)
      .addFileType('html',KBatchLoader.ajax);
    }

    KBatchLoader.fetchBatch = function(files,fn)
    {
      files.contents = [];
      files.contents.fileNames = files;
      files.contents.loaded = files.map(Number.prototype.valueOf,0);
      files.contents.types = files.map(function(file){
        return (file.lastIndexOf('.') !== -1 && file.indexOf('.min') !== file.lastIndexOf('.') ? file.substring((file.lastIndexOf('.')+1),file.length) : 'js');
      });

      function onFetch(count)
      {
        files.contents.loaded[count] = 1;
        var f = new fetchObject(files[count],files.contents.types[count],files.contents.loaded[count],this,(this.responseText !== undefined ? this.responseText : undefined));
        if(_onFetch(f) !== true)
        {
          files.contents[count] = this;
        }
        else
        {
          files.contents.loaded[count] = -1;
        }
        if(files.contents.loaded.indexOf(0) === -1)
        {
          fn(files.contents);
        }
      }

      for(var x=0,len=files.length;x<len;x++)
      {
        (function(count){
          if(_types[files.contents.types[x]] !== undefined)
          {
            KBatchLoader.fetchSingle(files[x],files.contents.types[x],function(e){onFetch.call(this,count);});
          }
          else
          {
            files.contents.loaded[count] = -1;
          }
        }(x));
      }
    }

    KBatchLoader.fetchSingle = function(file,type,fn)
    {
      if(_types[type] !== undefined)
      {
        _types[type](file,fn);
      }
      else
      {
        fn.call(undefined,null);
      }
      return null;
    }

    KBatchLoader.ajax = function(file,fn)
    {
      var xhr = new XMLHttpRequest();
      xhr.onload = fn.bind(xhr);
      xhr.open("GET",(file),true);
      xhr.send(null);
    }

    KBatchLoader.addFileType = function(type,fn)
    {
      if(_types[type] === undefined)
      {
        _types[type] = fn;
      }
      else
      {
        console.error("There is already a type by the name %o",type);
      }
      return this;
    }

    KBatchLoader.removeFileType = function(type)
    {
      _types[type] = undefined;
      return this;
    }

    KBatchLoader.addFetchListener = function(func)
    {
      _fetchListeners.push(func);
      return this;
    }

    KBatchLoader.removeFetchListener = function(func)
    {
      for(var x=0,len=_fetchListeners.length;x<len;x++)
      {
        if(_fetchListeners[x].toString() === func.toString())
        {
          _fetchListeners.splice(x,1);
          return this;
        }
      }
      return this;
    }

    return KBatchLoader;
  }
  return CreateKBatchLoader;
});
