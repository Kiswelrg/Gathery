// kinds of clicking
$(document).on("click", function(e) {
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

function getWarehouse(g) {
  return $.ajax({
    url: "/gallery/getWarehouse/",
    type: "GET",
    data: {
      gallery: g,
    },
  });
}

function exampleFromGoogle() {
  //read name type size
  const output = document.getElementById("output");
  if (window.FileList && window.File) {
    document
      .getElementById("file-selector")
      .addEventListener("change", (event) => {
        output.innerHTML = "";
        for (const file of event.target.files) {
          const li = document.createElement("li");
          const name = file.name ? file.name : "NOT SUPPORTED";
          const type = file.type ? file.type : "NOT SUPPORTED";
          const size = file.size ? file.size : "NOT SUPPORTED";
          li.textContent = `name: ${name}, type: ${type}, size: ${size}`;
          output.appendChild(li);
        }
      });
  }
}

function exampleFromGoogle2() {
  //read an image file
  const status = document.getElementById("status");
  const output = document.getElementById("output");
  if (window.FileList && window.File && window.FileReader) {
    document
      .getElementById("file-selector")
      .addEventListener("change", (event) => {
        output.src = "";
        status.textContent = "";
        const file = event.target.files[0];
        if (!file.type) {
          status.textContent =
            "Error: The File.type property does not appear to be supported on this browser.";
          return;
        }
        if (!file.type.match("image.*")) {
          status.textContent =
            "Error: The selected file does not appear to be an image.";
          return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
          output.src = event.target.result;
        });

        reader.addEventListener("progress", (event) => {
          if (event.loaded && event.total) {
            const percent = (event.loaded / event.total) * 100;
            console.log(`Progress: ${Math.round(percent)}`);
          }
        });

        reader.readAsDataURL(file);
      });
  }
}

const generateCSV = () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([{ a: 1, b: 2 }]);
  XLSX.utils.book_append_sheet(wb, ws, "test");
  XLSX.writeFile(wb, "test.csv");
};

let b;
const clickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function (event) {
      if (el == event.target || el.contains(event.target)) return;
      binding.value(el);
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  }
}

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

let a = [];
const importart_app = Vue.createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      Arts: [],
      Ws: [],
      Gs: [],
      Ms: [
        {'id':'0','name':'use selected warehouse as every art\'s warehouse '},
        {'id':'1','name':'do not use selected warehouse at all (this causes records without warehouse specified unable to be imported, since every art should be in some warehouse.)'},
        {'id':'2','name':'use selected warehouse for records with no warehouse specified in files'},
      ],
      ModeName: {
        0:'selected warehouse',
        1:'only ones in forms',
        2:'combination',
      },
      Lang: 'eng',
      SddHeader: {
        'eng': [
          "name",
          "date made",
          "warehouse",
          "gallery",
          "last transit",
          "author",
          "rack",
          "status",
          "picture",
          "info",
        ],
        'zh': [
          "名称",
          "创作日期",
          "库房",
          "画廊",
          "最后交易",
          "作者",
          "货架",
          "状态",
          "照片",
          "信息",
        ],
      },
      DateHeader: [
        "date made",
        "last transit"
      ],
      fileDetail: {
        'fileNames': [],
        'files': {
          // 'name0': {
          //   'artHeaders' : [],
          //   'headerIndexes': [],
          // },
          // 'name1': {
          //   'artHeaders' : [],
          //   'headerIndexes': [],
          // },
        },
      },

    };
  },
  computed: {
    currentHeaders() {
      return this.SddHeader[this.Lang];
    },
    getTZ() {
      let d = new Date();
      console.log(d.getTimezoneOffset()/(60));
      return d.getTimezoneOffset()/(60);
    }
  },
  methods: {
    statusP(s) {
      if (s === undefined) return 1;
      return s
    },
    urlParam(p) {
      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });
      return params.p;
    },
    changeSelect(e){
      let t = $(e.target);
      if (!t.hasClass('text-gray-900')) return 0;
      t.siblings().removeClass('text-white bg-indigo-600 selected').addClass('text-gray-900');
      t.addClass('text-white bg-indigo-600 selected').removeClass('text-gray-900');
      return t;
    },
    dateForDisplay(date) {
      return date.toISOString().split('T')[0];
    },
    async selectGallery(e) {
      let opt = this.changeSelect(e);
      if (opt) {$("#g-button-text").text(opt.find('.name').text()); await this.fetchW();}
    },
    async selectWarehouse(e) {
      let opt = this.changeSelect(e);
      if (opt) $("#w-button-text").text(opt.find('.name').text());
    },
    async selectMode(e) {
      let opt = this.changeSelect(e);
      if (opt){
        let mid = opt.find('[mid]').attr('mid');
        $("#m-button-text").text(this.ModeName[mid]);
      }
    },
    async fetchW() {
      const d = await getWarehouse(
        $("#g-selector .text-white.bg-indigo-600").attr("gid")
      )
        .done(function (data, textStatus, xhr) {
          let l = $("#w-selector ul li").eq(0);
          l.removeClass('text-gray-900').addClass("text-white bg-indigo-600");
          l.find('.text-indigo-600').removeClass('text-indigo-600').addClass('text-white');
          // console.log(xhr.status); // 200
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      let data = "[" + d.replaceAll("}{", "},{").replaceAll("'", '"') + "]";
      data = await JSON.parse(data);
      this.Ws = data;
    },
    toggleDropdown(e) {
      let tgt = $(e.target).next();
      if (!tgt.hasClass('opacity-100')){
        tgt.addClass('opacity-100 z-10');
        // tgt.addClass('transition ease-in duration-100 opacity-100');
        // setTimeout(function() { 
        //   tgt.removeClass('transition ease-in duration-100');
        // }, 100);
      } else {
        tgt.removeClass('opacity-100 z-10');
      }
    },
    closeDropdown(e) {
      $(e).next().removeClass('opacity-100 z-10');
    },
    async constructHeadIndex() {
      if(this.Lang == '') this.selectLang();
      for (const name in this.fileDetail['fileNames']){
        let hs = this.fileDetail['files'][this.fileDetail['fileNames'][name]]['artHeaders'];
        let is = [];
        for(let i=0; i<hs.length; i++) {
          let current_idx = [];
          this.SddHeader[this.Lang].forEach((sdd_h, index) => {
            let idx = -1;
            for(let j=0; j<hs[i].length; j++){
              if (typeof hs[i][j] == 'string' && hs[i][j].toLowerCase() == sdd_h) idx = j;
            }
            current_idx.push(idx);
            // current_idx.push(index);
          });
          is.push(current_idx);
        }
        this.fileDetail['files'][this.fileDetail['fileNames'][name]]['headerIndexes'] = is;
      }
    },
    async readFileHead(f) {
      return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.addEventListener("load", (e) => {
          let data = e.target.result;
          let workbook = XLSX.read(data, { type: "binary" });
          let sheetNames = workbook.SheetNames;
          this.fileDetail['files'][f.name] = {
              'artHeaders' : [],
              'headerIndexes': [],
            };
          // let sheetcount = 1;
          sheetNames.forEach((name) => {                                                  //per sheet in file
            let worksheet = workbook.Sheets[name];
            const m = XLSX.utils.decode_range(worksheet["!ref"]).e;
            if (m.r == 0) return;
            const columnCount = m.c + 1;
            sheetHeaders = [];
            for (let i = 0; i < columnCount; ++i) {
              let h = worksheet[`${XLSX.utils.encode_col(i)}1`];
              if (h == undefined) h = ''; else h = h.v;
              sheetHeaders.push(h);
            }
            this.fileDetail['files'][f.name]['artHeaders'].push(sheetHeaders);

            // show file detail 

            // let _JsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
            // console.log(
            //   `sheet ${sheetcount++}: with ${columnCount} columns and ${
            //     _JsonData.length
            //   } objects`
            // );

          });
          resolve(reader.result);
        });
        reader.onerror = reject;
        reader.readAsBinaryString(f);
      });
    },
    async readArtInFile(f, fn) {
      return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.addEventListener("load", (e) => {
          let data = e.target.result;
          let workbook = XLSX.read(data, { type: "binary" });
          const is_date1904 = !!(((workbook.Workbook||{}).WBProps||{}).date1904);
          //XLSX.writeFile(workbook, "output.xlsx");
  
          let sheetNames = workbook.SheetNames;
          sheetNames.forEach((name, idx) => {                                     // sheet per file
            let worksheet = workbook.Sheets[name];
            let _JsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, cellDates: true });
            // console.log(_JsonData);
            let h = this.fileDetail['files'][fn]['artHeaders'][idx];
            let h_idx = this.fileDetail['files'][fn]['headerIndexes'][idx];
            if (h_idx == undefined) return;

            //暂时检查是否有valid表头,只要有一个就读这个sheet
            let check = h_idx.some(function(el) {
                return el!=-1;
            });

            if (check == false) return;

            // sheet里的每一个art记录
            // map函数的用法可以一提 应该能提高性能
            _JsonData.forEach((value) => {
              let art = {};
              this.DateHeader.forEach((d_h) => { 
                console.log(value[d_h]);
                value[d_h] =  fixImportedDate(Date.parse(value[d_h]), is_date1904);
              });
              this.SddHeader[this.Lang].forEach((sdd_h, index) => {
                if (h_idx[index] != -1) {
                  art[sdd_h] = value[h[h_idx[index]]];
                }
              });
              if (art['name'] != undefined || art['名称'] != undefined)
                this.Arts.push(art);
            });

          });
          resolve(reader.result);
        });
        reader.onerror = reject;
        reader.readAsBinaryString(f);
      });
    },
    async readArtInFile2(f, fn) {
      return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.addEventListener("load", (e) => {
          let data = e.target.result;
          let workbook = XLSX.read(data, { type: "binary" });
          const is_date1904 = !!(((workbook.Workbook||{}).WBProps||{}).date1904);
          //XLSX.writeFile(workbook, "output.xlsx");
  
          let sheetNames = workbook.SheetNames;
          sheetNames.forEach((name, idx) => {                                     // sheet per file
            let worksheet = workbook.Sheets[name];
            let _JsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true, cellDates: true });
            // console.log(_JsonData);
            let h = this.fileDetail['files'][fn]['artHeaders'][idx];
            let h_idx = this.fileDetail['files'][fn]['headerIndexes'][idx];
            if (h_idx == undefined) return;

            //暂时检查是否有valid表头,只要有一个就读这个sheet
            let check = h_idx.some(function(el) {
                return el!=-1;
            });

            if (check == false) return;

            // sheet里的每一个art记录
            // map函数的用法可以一提 应该能提高性能
            _JsonData.forEach((value) => {
              let art = {};
              this.DateHeader.forEach((d_h) => {

                if (typeof value[d_h] == 'string'){
                  vv = dayjs(value[d_h]);
                  if (vv.$y < 1901)
                    console.log('smaller than 1901');
                  if (vv.$y < 1901)
                    vv = vv.add(5,'minute').add(43,'second');
                  console.log(value[d_h]);
                  value[d_h] = vv.$d;
                  console.log(value[d_h]);
                }
                else
                  value[d_h] =  fixImportedDate2(Math.round(value[d_h]), is_date1904);
              });
              this.SddHeader[this.Lang].forEach((sdd_h, index) => {
                if (h_idx[index] != -1) {
                  art[sdd_h] = value[h[h_idx[index]]];
                }
              });
              if (art['name'] != undefined || art['名称'] != undefined)
                this.Arts.push(art);
            });

          });
          resolve(reader.result);
        });
        reader.onerror = reject;
        reader.readAsBinaryString(f);
      });
    },
    async fileInfo(event) {
      this.fileDetail = {
        'fileNames': [],
        'files': {},
      };
      for (let i = 0; i < event.target.files.length; ++i) {
        // console.log(`num: ${i} , file name ${event.target.files[i].name}`);
        this.fileDetail['fileNames'].push(event.target.files[i].name);
        await this.readFileHead(event.target.files[i]);
      }

      this.constructHeadIndex();

      //let user set header index at here
      //right now this is not implemented

      //then generate arts
      this.generateArts(event);
    },
    async generateArts(event) {
      for (let i = 0; i < event.target.files.length; ++i) {
        await this.readArtInFile2(event.target.files[i], event.target.files[i].name);
      }

    },
    async submitImport() {
      $('#importArtForm #smt-button').prop("disabled", true );
      if (this.Arts.length == 0) {
        alert("No arts have been imported yey!");
        return;
      }
      let data = {
        'csrfmiddlewaretoken': $("#importArtForm input[name='csrfmiddlewaretoken']").val(),
        'wh': $("#w-selector .wh-opt.selected").attr('wid'),
        'arts': JSON.stringify(this.Arts),
        'mode': $("#m-selector .wh-opt.selected").attr('mid'),
        'tz': $("#importArtForm input[name='tz']").val(),
      };
      let res = await $.ajax({
        url: "/gallery/importarts/",
        type: "POST",
        data: data,
      }).done(function (data, textStatus, xhr) {
        
        // console.log(xhr.status); // 200
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.status);
      });
      console.log(res);
      this.Arts = [];
      this.fileDetail = {
        'fileNames': [],
        'files': {},
      }
      $('#importArtForm #smt-button').prop("disabled", false);
      document.getElementById('fileinput').value = null;
    },
    showArtAttrType() {
      this.Arts.forEach((art, idx) => {
        console.log(idx+1);
        for (const [key, value] of Object.entries(art)) {
          console.log(`${key}: ${value} - type ${typeof value}`);
        }
      });
    }
  },
  async mounted() {
    await this.fetchW();
  },
});

importart_app.component("art-preview-app", art_preview_app);
importart_app.directive('click-outside', clickOutside);

let vm = importart_app.mount("#importart");


