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

let art_preview_app = {
  name: "art-preview-app",
  props: {
    Arts: Array,
  },
  computed: {},
  methods: {},
  template: `
    `,
};

let a;
const crtg_app = Vue.createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      Ws: [],
			whHelp: false,
    };
  },
  computed: {},
  methods: {
    sumName(n) {
      return n[0];
    },
    checkEmpty(e) {
      if (e.key == 'Enter' || e.target.value != '') this.whHelp = false;
    },
    async addWh() {
      if ($('input[name="wh-name"]').val() == '') {
        this.whHelp = true;
        return;
      }
      this.Ws.push({
        name : $('input[name="wh-name"]').val(),
        sum : this.sumName($('input[name="wh-name"]').val()),
      });
      $('input[name="wh-name"]').val('');
    },
    async deleteW(wid) {
      this.Ws.splice(wid, 1);
    },
    async checkInputs() {
      let ck = true;
      name_list = ['name','city','date-create'];
      name_list.forEach(name => {
        if ($(`input[name="${name}"]`).val() == '') {
          $(`input[name="${name}"]`).focus();
          ck = false;
        }
      });
      if (this.Ws.length == 0) {
        console.log("checking ws");
        ck = false;
        this.whHelp = true;
        $(`input[name="wh-name"]`).focus();
      }
      return ck;
    },
    async crtGallery() {
      let ck = await this.checkInputs();
      if (!ck) return;
      $("#smt-button").prop("disabled", true);
      let data = {
        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
        name: $('input[name="name"]').val(),
        city: $('input[name="city"]').val(),
        ws: JSON.stringify(this.Ws),
        date_create: $('input[name="date-create"]').val(),
      };
      let res = await $.ajax({
        url: "/gallery/crtgallerys/",
        method: "POST",
        data: data,
      })
        .done(function (data, textStatus, xhr) {
          console.log(data);
          // window.location.replace('');
          // console.log(xhr.status); // 200
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
    },
  },
  async mounted() {
    await this.fetchW();
  },
});

// importart_app.component("art-preview-app", art_preview_app);

let vm = crtg_app.mount("#crtg-app");
