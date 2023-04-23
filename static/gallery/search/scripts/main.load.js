/*  pre-defined funcs 
    1.0.0

*/

/*  pre-defined funcs 
    1.1.1
    get g/w/a ...
    */

function urlParam() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  return params;
}

function getWarehouse(g) {
  return $.ajax({
    url: "/gallery/getWarehouse/",
    method: "GET",
    data: {
      csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
      gallery: g,
    },
  });
}

function getArt(s) {
  if (urlParam().page != null)
    $("#ArtSearchForm input[name='page']").val(urlParam().page);
  return $.ajax({
    url: $("#ArtSearchForm").attr("action"),
    method: "GET",
    data: s === undefined || s == "" ? $("#ArtSearchForm").serialize() : s,
  });
}

/*  click listeners 
    1.1.2
    ...
    */

$(document).on("click", function (e) {
  tgt = $(e.target);

  //go find warehouse 1.2.2 (before toggle open)
  if (tgt.hasClass("input-cell")) {
    p = tgt.parents().eq(2);
  }

  //...
});

let test_component = {
  name: "test-component",
  props: {
    testnum: {
      type: Number,
      default: 34,
    },
  },
  computed: {},
  methods: {},
};

let pagination_app = {
  name: "search-pagination",
  props: {
    currentpage: Number,
    pagenum: Number,
  },
  computed: {
    nextpage() {
      return (
        "/gallery/search/?page=" +
        ((this.currentpage + 1) % (this.pagenum + 1)).toString()
      );
    },
    prevpage() {
      return (
        "/gallery/search/?page=" +
        (this.currentpage == 1 ? 1 : this.currentpage - 1).toString()
      );
    },
  },
  methods: {
    pageButtonShow(n) {
      if (this.pagenum == 0) return !(n % 2);
      return (
        (this.currentpage == Math.floor(n / 3) * (this.pagenum - 1) + 1) ^ n % 2
      );
    },
  },
  template: `
  <div class="pagination-ctrl">
  <div class="pagination-ctrl__content">
    <a
      class="pagination-ctrl__btn icon icon-paginationleft"
      :class="{'pagination-ctrl__btn--disabled':pageButtonShow(2)}"
      :href="prevpage"
    ></a>
    <span
      class="pagination-ctrl__span icon icon-paginationleft"
      :class="{'pagination-ctrl__span--visible':pageButtonShow(2)}"
    >
    </span>
    <div class="pagination-ctrl__info">
      <span class="">{{ currentpage }}</span><span class=""> 页 </span
      ><span class="">{{ pagenum }}</span>
    </div>
    <a
      class="pagination-ctrl__btn icon icon-paginationright"
      :class="{'pagination-ctrl__btn--disabled':pageButtonShow(4)}"
      :href="nextpage"
    >
    </a>
    <span
      class="pagination-ctrl__span icon icon-paginationright"
      :class="{'pagination-ctrl__span--visible':pageButtonShow(4)}"
    >
    </span>
  </div>
  </div>
  `,
};

let wh_app = {
  name: "spmenu-filter-wh",
  props: {
    ws: Array,
  },
  data() {
    return {};
  },
};

let result_app = {
  name: "search-result",
  props: {
    as: Array,
    artnum: Number,
    un: String,
  },
  data() {
    return {
      statusname: ["损坏", "在馆藏", "运输中", "出借", "借入", "已售"],
    };
  },
  computed: {},
  emits: ["open-edit"],
  template: `
    <div class="result" id="result">
    <h2 class="result-summary">{{ artnum }} 搜索结果</h2>

    <div class="result-can">
      <div class="item-dust">
        <div class="info">Info</div>
        <div class="undo">Show</div>
      </div>
      <div class="item-body">
        <div class="item-controller">
          <div class="info">
            <div class="search-type">
              <svg
                style="max-height: 10px"
                class="svg-inline--fa fa-scroll fa-w-20"
                aria-hidden="true"
                data-prefix="fas"
                data-icon="scroll"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M48 0C21.53 0 0 21.53 0 48v64c0 8.84 7.16 16 16 16h80V48C96 21.53 74.47 0 48 0zm208 412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74 13.41 128 29.92 128 48v368c0 38.87 34.65 69.65 74.75 63.12C234.22 474 256 444.46 256 412.57zM288 384v32c0 52.93-43.06 96-96 96h336c61.86 0 112-50.14 112-112 0-8.84-7.16-16-16-16H288z"
                ></path>
              </svg>
              藏品
            </div>
            <div class="search-keyword">{{ un }}</div>
          </div>
          <div class="ctrl-button">
            <span class="navbar-burger burger stay" data-target="navbarMenuHeroA">
              <span v-for="i in 3"></span>
            </span>
          </div>
        </div>

        <div class="srch-item transcipt-item">
          <table
            class="table is-striped is-hoverable is-fullwidth"
            style="font-size: 10px"
          >
            <thead>
              <tr>
                <td width="15%">名称</td>
                <td width="10%">id</td>
                <td width="10%">画廊</td>
                <td width="10%">库房</td>
                <td width="15%">作者</td>
                <td width="10%">制作<br />日期</td>
                <td width="10%">入库<br />日期</td>
                <td width="10%">货架</td>
                <td width="10%">状态</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="art in as" :key="as.id" :a_id="art.id" @click="$emit('open-edit', art, 0)">
                <td style="text-align: center">{{ art.name }}</td>
                <td>{{ art.id }}</td>
                <td style="text-align: right">{{ art.gallery }}</td>
                <td>{{ art.wh_name }}</td>
                <td style="text-align: center">{{ art.author }}</td>
                <td style="text-align: center">{{ art.date_made }}</td>
                <td style="text-align: right">{{ art.date_add }}</td>
                <td style="text-align: center">{{ art.rack }}</td>
                <td style="text-align: center">{{ statusname[art.status] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  `,
  methods: {
    test() {
      console.log("1");
    },
  },
};

let a;
const search_app = Vue.createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      gs: [],
      ws: [],
      as: [],
      artNum: 0,
      username: "",
      maxperpage: 20,
      current_editing_art: undefined,
      editTabs: ["Single", "Batch"],
      editWidget: {
        activeWidget: "art",
        art: {
          show: true,
          mode: ["update", "create"],
          titles: ["Edit an Art", "Create an Art"],
          activeIndex: 0,
        },
      },
    };
  },
  computed: {
    currentWidgetTitle() {
      let app = this.editWidget[this.editWidget.activeWidget];
      return app.titles[app.activeIndex];
    },
    pageInUrl() {
      return urlParam().page;
    },
    currentpage() {
      return this.pageInUrl == null ? 1 : parseInt(this.pageInUrl);
    },
    pagenum() {
      return Math.ceil(this.artNum / this.maxperpage);
    },
  },
  methods: {
    async fetchGallery() {
      let data = {
        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
      };
      let res = await $.ajax({
        url: "/gallery/getGallery/",
        method: "GET",
        data: data,
      })
        .done(function (data, textStatus, xhr) {})
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      let d = "[" + res.replaceAll("}{", "},{").replaceAll("'", '"') + "]";
      this.gs = JSON.parse(d);
    },
    async getUser(o) {
      // 0 for staff, 1 for w
      let data = {
        csrfmiddlewaretoken: await this.getToken(),
        g: o
          ? $("#warehouse-manage li.selected").attr("gid")
          : $("#staff-manage li.selected").attr("gid"),
        m: "wu",
      };
      let res = await $.ajax({
        url: "/gallery/getUser/",
        method: "GET",
        data: data,
      })
        .done(function (data, textStatus, xhr) {
          // window.location.replace('');
          // console.log(xhr.status); // 200
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      if (o) this.selfuser1 = JSON.parse(res);
      else this.selfuser0 = JSON.parse(res);
    },
    openArtEdit(a, o) {
      if (a) this.fetchAImage(a.id);
      this.current_editing_art = a;
      this.editWidget.activeWidget = "art";
      this.editWidget.art.show = true;
      this.editWidget.art.activeIndex = o;
    },
    closeArtEdit() {
      this.editWidget.art.show = false;
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
      ];
      active_tab_class = "";
      for (cls of c) {
        active_tab_class += cls + " ";
      }
      if (t.hasClass(active_tab_class)) return false;
      $('[role="tablist"] .text-green-600.border-green-600').removeClass(
        active_tab_class
      );
      t.addClass(active_tab_class);
      return true;
    },
    async fetchW() {
      const d = await getWarehouse(
        $("#fc_gallery .fd-option--selected").attr("gid")
      )
        .done(function (data, textStatus, xhr) {
          $("#fc_warehouse")
            .find(".fd-option")
            .eq(0)
            .addClass("fd-option--selected");
          // console.log(xhr.status); // 200
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      let data = "[" + d.replaceAll("}{", "},{").replaceAll("'", '"') + "]";
      data = await JSON.parse(data);
      this.ws = data;
    },
    async fetchA() {
      if (!$("#asSbm").prop("disabled")) {
        // let d = await getArt(window.location.search.slice(1, -1))
        let d = await getArt()
          .done(function (d, textStatus, xhr) {})
          .fail(function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR.status);
          });
        if (d.slice(0, 9) == "<!DOCTYPE") window.location.replace("/u/signin/");
        if (d[1] == ",") d = "[" + d.slice(2);
        d = JSON.parse(d);
        this.artNum = d.at(-2)["artNum"];
        this.username = d.at(-1)["user"];
        this.as = d.slice(0, -2);
      }
    },
    async fetchAImage(id) {
      console.log('fetching image for ' + id);
      await $.ajax({
        url: "/gallery/getArtImage/",
        method: "GET",
        xhrFields: {
          responseType: 'blob'
        },
        data: {
          id: id,
        },
      })
        .done( (data, textStatus, xhr) => {
          // data.blob();
          // let url = URL.createObjectURL(d);
          for (a of this.as) {
            if (a['id'] == id)
              a.picture = data;
          }
          // URL.revokeObjectURL(downloadUrl);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      
    },
    async checkFetchW(e) {
      tgt = $(e.target);
      p = tgt.parents().eq(2);
      if (!p.hasClass("fd--opened") && tgt.attr("aria-2bload") == "1") {
        tgt.attr("aria-2bload", "0");
        this.fetchW();
      }
    },
    async getToken() {
      let res = await $.ajax({
        url: "/u/token/",
        method: "GET",
      })
        .done(function (data, textStatus, xhr) {
          return data;
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      return res;
    },
    async editArt(d) {
      let t = await this.getToken();
      console.log(t);
      d.append("csrfmiddlewaretoken", t);
      let res = await $.ajax({
        url: "/gallery/editArt/",
        cache: false,
        contentType: false,
        processData: false,
        method: "POST",
        data: d,
      })
        .done(function (data, textStatus, xhr) {})
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      console.log(res);
      if (res == "editing a") this.fetchA();
      this.closeArtEdit();
    },
  },

  async mounted() {
    // const urlParams = new URLSearchParams(window.location.search);
    this.fetchGallery();
    await this.fetchA();
    if (this.as.length > 0) this.current_editing_art = this.as[0];
  },
});

search_app
  .component("spmenu-filter-wh", wh_app)
  .component("search-pagination", pagination_app)
  .component("search-result", result_app)
  .component("art-edit-widget", art_edit_widget);

let vm = search_app.mount("#search-pane");
