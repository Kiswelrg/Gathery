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

function getWarehouse(g, m) {
  return $.ajax({
    url: "/gallery/getWarehouse/",
    type: "GET",
    data: {
      csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
      gallery: g,
      m: m,
    },
  });
}


let art_preview_cpt = {
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
const manage_app = Vue.createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      Gs: [],
      Staff: [],
      Ws: [],
      whStatus: {
        '0': 'closed',
        '1': 'open',
        '2': 'under construction',
        '3': 'destroyed'
      },
      stfStatus: {
        '0': '在职',
        '1': '离职',
        '2': '出差',
        '3': '在线',
        '4': '离线',
      },
      editTabs:[
        'Single',
        'Batch',
      ],
      editWidget: {
        activeWidget: 'staff',
        staff:{
          show: false,
          mode: ['update','create'],
          titles: [
            'Edit a record',
            'Create a record',
          ],
          activeIndex: 0,
        },
        warehouse:{
          show: false,
          mode: 'update',
          titles: [
            'Edit a record',
            'Create a record',
          ],
          activeIndex: 0,
        }
      },
      headers:{
        'staff': {
        },
      },
      stfRole: {
        '': '不确定',
        '0':'所有者',
        '1':'admin',
        '2':'管理员',
        '3':'临时管理员'
      },
      pvl: [
        '查询Art',
        '添加Art',
        '删改Art',
        '授权临时员工',
        '创建库房',
        '删改库房',
        '授权管理员',
        '修改画廊',
        '授权admin',
        '授权owner',
      ],
      current_editing_employee: undefined,
      current_editing_w: undefined,
      current_w_g: undefined,
      userOnTargetG: undefined,
      selfuser0: undefined,
      selfuser1: undefined,
    };
  },
  computed: {
    currentWidgetTitle() {
      let app = this.editWidget[this.editWidget.activeWidget];
      return app.titles[app.activeIndex];
    }
  },
  methods: {
    async getUser(o) { // 0 for staff, 1 for w
      let data = {
        csrfmiddlewaretoken: await this.getToken(),
        g: o?$("#warehouse-manage li.selected").attr("gid"):$("#staff-manage li.selected").attr("gid"),
        m: 'gu'
      };
      let res = await $.ajax({
        url: "/gallery/getUser/",
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
      if (o)
        this.selfuser1 = JSON.parse(res);
      else
        this.selfuser0 = JSON.parse(res);
    },
    async getUserOnTargetG(g) {
      let data = {
        csrfmiddlewaretoken: await this.getToken(),
        g: g,
      };
      let res = await $.ajax({
        url: "/gallery/getUser/",
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
      this.userOnTargetG = JSON.parse(res);
    },
    toggleDropdown(e) {
      let tgt = $(e.target).next();
      if (!tgt.hasClass("opacity-100")) {
        tgt.addClass("opacity-100 z-10").removeClass('hidden');
        // tgt.addClass('transition ease-in duration-100 opacity-100');
        // setTimeout(function() {
        //   tgt.removeClass('transition ease-in duration-100');
        // }, 100);
      } else {
        tgt.removeClass("opacity-100 z-10").addClass('hidden');
      }
    },
    closeDropdown(e) {
      $(e).next().removeClass("opacity-100 z-10").addClass('hidden');
    },
    changeSelect(e){
      let t = $(e.target);
      if (!t.hasClass('text-gray-900')) return 0;
      t.siblings().removeClass('text-white bg-indigo-600 selected').addClass('text-gray-900');
      t.addClass('text-white bg-indigo-600 selected').removeClass('text-gray-900');
      return t;
    },
    openStaffEdit(s, o) {
      this.current_editing_employee = s;
      //这里打开或者不打开warehouse input (控制一个在component的参数)
      this.editWidget.activeWidget = 'staff';
      this.editWidget.staff.show = true;
      this.editWidget.staff.activeIndex = o;
    },
    openWarehouseEdit(w, o) {
      this.current_editing_w = w;
      this.editWidget.activeWidget = 'warehouse';
      this.editWidget.warehouse.show = true;
      this.editWidget.warehouse.activeIndex = o;
      this.current_w_g = $("#warehouse-manage li.selected").attr("gid");
    },
    closeStaffEdit() {
      this.editWidget.staff.show = false;
    },
    closeWarehouseEdit() {
      this.editWidget.warehouse.show = false;
    },
    tabClick(e) {
      let t = $(e.target);
      c = [
        "text-green-600",
        "border-green-600",
        "dark:text-green-500",
        "dark:border-green-500",
        "hover:text-green-600",
        "hover:border-green-600",
        "dark:hover:text-green-500",
        "dark:hover:border-green-500",
      ]
      active_tab_class = '';
      for (cls of c) {
        active_tab_class += (cls + ' ');
      }
      if (t.hasClass(active_tab_class)) return false;
      $('[role="tablist"] .text-green-600.border-green-600').removeClass(active_tab_class);
      t.addClass(active_tab_class);
      return true;
    },
    
    async selectGallery(e, who) {
      let func,f2;
      if (who == 'staff'){
        func = this.fetchStaff;
        f2 = 0
      }
      else if (who == 'warehouse'){
        func = this.fetchW;
        f2 = 1
      }
      let opt = this.changeSelect(e);
      if (opt) {
        $(`#${who}-g-select`).text(opt.find('.name').text());
        await func();
        await this.getUser(f2);
        
      }
      
    },
    async fetchW() {
      const d = await getWarehouse(
        $("#warehouse-manage li.selected").attr("gid"), 1
      )
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      this.Ws = JSON.parse(d);
      if(this.Ws.length > 0) this.current_editing_w = this.Ws[0];
    },
    async fetchStaff() {
      let data = {
        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
        g: $("#staff-manage li.selected").attr("gid"),
        m: '0',
      };
      let res = await $.ajax({
        url: "/gallery/getStaff/",
        type: "GET",
        data: data,
      })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      this.Staff = [];
      res = JSON.parse(res);
      for (s of res.g_staff){
        this.Staff.push(s);
      }
      for (s of res.w_staff){
        s['role'] = '3';
        this.Staff.push(s);
      }
      if(this.Staff.length > 0) this.current_editing_employee = this.Staff[0];
    },
    async fetchGallery() {
      let data = {
        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
      };
      let res = await $.ajax({
        url: "/gallery/getGallery/",
        type: "GET",
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
      let d = "[" + res.replaceAll("}{", "},{").replaceAll("'", '"') + "]";
      this.Gs = JSON.parse(d);
    },
    async getToken() {
      let res = await $.ajax({
        url: "/u/token/",
        type: "GET",
      })
        .done(function (data, textStatus, xhr) {
          return data;
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      return res;
    },
    async editStaff(d) {
      d['g'] = $("#staff-manage li.selected").attr("gid");
      d['csrfmiddlewaretoken'] = await this.getToken();
      console.log(d);
      let res = await $.ajax({
        url: "/gallery/editStaff/",
        type: "POST",
        data: d,
      })
        .done(function (data, textStatus, xhr) {
          console.log(data);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      console.log(res);
    },
    async editWarehouse(d) {
      d['csrfmiddlewaretoken'] = await this.getToken();
      console.log(d);
      let res = await $.ajax({
        url: "/gallery/editWarehouse/",
        type: "POST",
        data: d,
      })
        .done(function (data, textStatus, xhr) {
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      console.log(res);
    },
  },
  async mounted() {
    await this.fetchGallery();
    // await this.fetchStaff();
    // await this.fetchW();
    // var event = document.createEvent('Event');
    // event.target = $('.title-button').eq(0).find('ul li')[0];
    // await this.selectGallery(event, 'staff');
    // event.target = $('.title-button').eq(1).find('ul li')[0];
    // await this.selectGallery(e, 'warehouse');
    for (let i=0; i<$('.title-button').length; i++) {
      await $('.title-button').eq(i).find('ul li').eq(0).click();
    }
    // this.fetchStaff();
    // this.fetchW();
    await this.getUser(0);
    if ($("#warehouse-manage li.selected").attr("gid") != $("#staff-manage li.selected").attr("gid"))
      await this.getUser(1);
    $('[role="tablist"] li button').eq(0).click(); // single and batch, 
  },
});

manage_app.directive("click-outside", clickOutside)
          .component("staff-edit-widget", staff_edit_widget)
          .component("warehouse-edit-widget", warehouse_edit_widget);

let vm = manage_app.mount("#manage-app");
