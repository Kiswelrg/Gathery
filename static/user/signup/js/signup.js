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
const signup_app = Vue.createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      idCheckExpression: /^(?=[a-zA-Z0-9_]{6,20}$)(?!.*[_]{2})[^_].*[^_]$/,
      idIsValid: false,
      idIsUsed: false,
      tips: {
        id: {
          show: false,
          text: '用户名是字母数字或者_组合, 数字不能在开头，下划线不能开头结尾或者连用',
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
  computed: {},
  methods: {
    checkEmpty(e) {
      if (e.key == "Enter" || e.target.value != "") this.whHelp = false;
    },
    checkValid() {
      return this.idCheckExpression.test($('input[name="username"]').val())
    },
    async checkUsed() {
      let data = {
        un: $('input[name="username"]').val(),
      };
      let res = await $.ajax({
        url: "/u/checkid/",
        type: "GET",
        data: data,
      })
        .done(function (data, textStatus, xhr) {
  
          // window.location.replace('');
          // console.log(xhr.status); // 200
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
        console.log(res);
        if(res == 'True')
          this.idIsUsed = true;
        else
          this.idIsUsed = false;

    },
    async checkId() {
      this.idIsValid = this.checkValid();
      this.tips.id.show = !this.idIsValid;
      await this.checkUsed();
    },
    async signup(e) {
      if (!this.idIsUsed || !this.idIsValid)  e.preventDefault();

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
  },
});

// importart_app.component("art-preview-app", art_preview_app);

let vm = signup_app.mount("#signup-app");
