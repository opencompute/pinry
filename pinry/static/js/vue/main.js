
function fetchPins(offset) {
    var apiUrl = API_BASE + 'pins/?format=json&ordering=-id&limit=50&offset='+String(offset);
    if (tagFilter) apiUrl = apiUrl + '&tags__name=' + tagFilter;
    if (userFilter) apiUrl = apiUrl + '&submitter__username=' + userFilter;
    return axios.get(apiUrl)
}

Vue.component('pin', {
  data: function () {
    return {
      'loaded': false,
      'editable': true,
      'active': false,
      'textId': null,
      'imageStyle': null,
      'pinStyle': null,
    }
  },
  props: ['pin', 'args', 'index'],
  template: '#pin-template',
  mounted: function() {
    this.imageStyle = {
      width: this.pin.image.thumbnail.width + 'px',
      height: this.pin.image.thumbnail.height + 'px',
    };
    this.pinStyle = this.getPinStyle();
  },
  methods: {
    getPinStyle: function() {
      var self = this;

      var marginLeft = 0;
      var marginTop = 0;

      function isFirstOne(rowSize, index) {
        index = index + 1;
        if ((index % rowSize) === 1 ){
          return true;
        }
      }

      function getRowNumber(rowSize, index) {
        index = index + 1;
        var rowNumber = Math.floor(index % rowSize);
        if (rowNumber === 0) {
          return 7;
        }
        return rowNumber;
      }

      function getLineNumber(rowSize, index) {
        return Math.floor((index) / rowSize);
      }
      var lineNumber = getLineNumber(self.args.rowSize, self.index);
      marginTop = self.args.blockMargin + (self.args.blockMargin + 300) * lineNumber;

      if (isFirstOne(self.args.rowSize, self.index)) {
        marginLeft = self.args.rowStartMargin;
      } else {
        var marginPerBlock = self.args.blockWidth + self.args.blockMargin;
        var rowNumber = getRowNumber(self.args.rowSize, self.index);
        marginLeft = self.args.rowStartMargin + marginPerBlock * (rowNumber - 1);
      }
      return {
        'margin-left': marginLeft + 'px',
        'margin-top': marginTop + 'px',
      };
    },
    onImageLoad: function () {
      this.loaded = true;
    },
    getAvatar: function () {
      return "//gravatar.com/avatar/" + this.pin.submitter.gravatar;
    },
    getUserLink: function () {
      return "/pins/users/" + this.pin.submitter.username + "/"
    },
    getTagLink: function (tag) {
      return "/pins/tags/" + tag + "/"
    },
    getTextHeight: function() {
      var element = this.$el;
      var height = element.getBoundingClientRect().height;
      return height
    },
  }
});


Vue.component('pin-container', {
  data: function () {
    return {
      args: {
        "containerWidth": 0,
        "blockWidth": 240,
        "blockMargin": 15,
        "rowSize": 0,
        "rowStartMargin": 0,
        "rowEndMargin": 0,
      },
      "pins": [],
    };
  },
  template: "#pin-container-template",
  created: function() {
      this.$emit("loading");
      var self = this;
      var offset = 0;
      fetchPins(offset).then(
        function (res) {
          self.pins = res.data.results;
          self.$emit(
            "loaded",
          );
        },
      );
  },
  mounted: function() {
    this.updateArguments()
  },
  methods: {
    updateArguments: function() {
      var blockContainer = this.$el;
      var containerWidth = blockContainer.clientWidth;
      var blockMargin = this.args.blockMargin,
          blockWidth = this.args.blockWidth,
          rowSize = Math.floor(containerWidth / (blockWidth + blockMargin));
      var rowStartMargin = (containerWidth - rowSize * (blockWidth + blockMargin)) / 2 ;
      var rowEndMargin = rowStartMargin - blockMargin;

      this.args.containerWidth = containerWidth;
      this.args.blockWidth = blockWidth;
      this.args.blockMargin = blockMargin;
      this.args.rowSize = rowSize;
      this.args.rowStartMargin = rowStartMargin;
      this.args.rowEndMargin = rowEndMargin;
    },
  },
});


var app = new Vue({
  el: '#app',
  data() {
    return {
      loading: true,
    }
  },
  methods: {
    onLoaded: function(){
      this.loading = false;
    },
    onLoading: function(){
      this.loading = true;
    },
  },
});