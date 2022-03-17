// kinds of clicking
$(document).on("click", function (e) {
  tgt = $(e.target);

  // if (!tgt.closest(".tooltip").length) {
  //     //burger on search item
  //     if (!tgt.hasClass("burger")) {
  //         $(".tooltip").prev().removeClass("is-active");
  //         $(".tooltip").remove();
  //     }
  // }

  // if (!tgt.hasClass('select-menu')){
  //   tgt.find('.dropdown-menu.opacity-100').removeClass('opacity-100 z-10');
  // }
});

let some_component = {
  name: "art-preview-cpt",
  props: {
    Arts: Array,
  },
  computed: {},
  methods: {},
  template: `
      `,
};

let a;
const signin_app = Vue.createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      idCheckExpression: /^(?=[a-zA-Z0-9_]{6,20}$)(?!.*[_]{2})[^_].*[^_]$/,
      idIsValid: false,
      idIsUsed: false,
      base_action: '/u/login/',
      wish: '',
      tips: {
        id: {
          show: false,
          text: '用户名或密码不正确',
        },
        password: {
          show: false,
          text: '',
        },
        vcode: {
          show: false,
          text: '验证码不正确',
        },
      }
    };
  },
  computed: {
    action() {
      return this.base_action + '?wish=' + encodeURIComponent(this.wish);
    },
  },
  methods: {
    checkEmpty(e) {
      if (e.key == "Enter" || e.target.value != "") this.whHelp = false;
    },
    checkValid() {
      return this.idCheckExpression.test($('input[name="username"]').val())
    },
    async checkUsed() {

    },
    async checkId() {
      
    },
    async signin(e) {

    },

  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('username') == '0')
    {
      this.tips.id.show = true;
    }
    else if (urlParams.get('vcode') == '0') {
      this.tips.vcode.show = true;
    }
    if (urlParams.get('wish') !== null) {
      this.wish = urlParams.get('wish');
    }
  },
});

// importart_app.component("art-preview-app", art_preview_app);

let vm = signin_app.mount("#signin-app");
