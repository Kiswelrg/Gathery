const clickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function (event) {
      if (el == event.target || el.contains(event.target)) return;
      if (typeof binding.value === 'function')
        binding.value(el);
    };
    document.body.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener("click", el.clickOutsideEvent);
  },
};


let staff_edit_widget = {
  directives: {clickOutside},
  name: "staff-edit-widget",
  props: {
    pvllist: Array,
    user: Object,
    employee: Object,
    ws: Array,
    widgetinfo: Object,
  },
  data() {
    return {
      status: 0,
      m: 0,
      base: [
        0b000001000000000,
        0b000000100000000,
        0b000000001000000,
        0b000000000001000,
      ],
      base_r_index: [
        10,9,7,4
      ],
      rolename: [
        'owner','admin','manager','temp'
      ],
      statusname: [
        '在职','离职','出差'
      ],
      stfrole: {
        '': '不确定',
        '0':'所有者',
        '1':'admin',
        '2':'管理员',
        '3':'临时管理员'
      },
      role: 2,
    };
  },
  computed: {
    showW(){
      return Math.floor(this.role/3);
    },
    maxGrant(){
      for (b of this.base) {
        if (((this.user.user||{}).privilege || 0)&b) return b;
      }
      return 0;
    },
    ableToGrant() {
      return (this.maxGrant << 1) - 1;
    },
    validRole() {
      return this.rolename.filter((ele, index) => this.maxGrant >= this.base[index] )
    },
  },
  methods: {
    getRole() {
      let base_r = 3;
      for (const [index, b] of this.base.entries()) {
        if ((this.caculatePri())&b) {
          base_r = index;
          break;
        }
      }
      if (this.caculatePri()>>this.base_r_index[base_r]) base_r--;
      return base_r;
    },
    affectBoxes(){
      let max_possible = (this.base[this.role] << 1) - 1;
      $('.privilege-checkboxes input[type="checkbox"]').each(function(index) {
        if ($(this).prop('checked') && !(max_possible&Math.pow(2,index)))
          $(this).prop('checked',false);
      });
    },
    setRole() {
      this.role = this.rolename.indexOf($('#position-select').val());
      this.affectBoxes();
    },
    setStatus(e) {
      console.log(this.statusname.indexOf($(e.target).val()));
      this.status = this.statusname.indexOf($(e.target).val());
    },
    caculatePri() {
      let sum = 0;
      $('.privilege-checkboxes input[type="checkbox"]').each(function(index) {
        sum += $(this).prop('checked') * Math.pow(2, index);
      });
      return sum;
    },
    checkBox(e) {
      let box = $(e.target).find('input[type="checkbox"]');
      if (!box.prop("disabled"))
        box.prop("checked", !box.prop("checked"));
      //这里判断是否弹出warehouse input
    },
    getType(m) {
      if (m) {
        if (this.getRole() > 2)
          return 1;
        else
          return 0;
      }
      let r = 0;
      if ( parseInt(this.employee.role) > 2 ) r+=2;
      if ( this.getRole() > 2) r+=1;
      console.log(r);
      return r;
    },
    toggleDropdown(e) {
      let tgt = $(e.target).next();
      if (!tgt.hasClass("opacity-100")) {
        tgt.addClass("opacity-100 z-10").removeClass('hidden');
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
    async selectWarehouse(e) {
      let opt = this.changeSelect(e);
      if (opt) $('#w-select').text(opt.find('.name').text());
    },
    formData(m) {
      return {
        m: m,
        type: this.getType(m),
        w: $("#w-selector .wh-opt.selected").attr('wid') || ((this.employee||{}).warehouse__urlCode || ''),
        employee: JSON.stringify({
          ph: m == 1 ? $('input#phId').val() : this.employee.employee_id,
        }),
        info: JSON.stringify({
          role: this.getRole(),
          privilege: this.caculatePri(),
          status: this.status,
          date_join: $('input#date_join').val() 
        }),
      }
    }
  },
  mounted() {
  },
  emits: ['close-edit', 'edit-staff', 'close-dropdown', 'toggle-dropdown'],
  template: `
    <div id="myTabContent">
      <div
        class="p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
        id="profile"
        role="tabpanel"
        aria-labelledby="profile-tab"
      >
      <table
        v-if="employee !== undefined"
        class="block max-h-96 overflow-auto min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
              employee
          </th>
          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
              Title
          </th>
          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
              Status
          </th>
          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
              Warehouse
          </th>
          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
              Join
          </th>
          <th class="relative px-4 py-3" scope="col">
              <span class="sr-only">Edit</span>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr>
          <td class="px-4 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <img
                  alt=""
                  class="h-10 w-10 rounded-full"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=4&amp;w=256&amp;h=256&amp;q=60"
                />
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">{{ employee.employee_n }}</div>
                <div class="text-sm text-gray-500">{{ employee.employee_id }}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ stfrole[employee.role] }}</div>
            <div class="text-sm text-gray-500">{{ employee.privilege }}</div>
          </td>
          <td class="px-4 py-4 whitespace-nowrap">
            <span
              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"
              >{{ employee.status }}</span
            >
          </td>
          <td class="px-4 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ employee.warehouse__name }}</div>
            <div class="text-sm text-gray-500">{{ employee.warehouse__urlCode }}</div>
          </td>
          <td class="px-4 py-4 whitespace-nowrap">
            <span
              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"
              >{{ employee.date_join }}</span
            >
          </td>
        </tr>   
      </tbody>
    </table>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          下方从左往右的权限选项,
          <strong class="font-medium text-gray-800 dark:text-white"
            >等级依次递增,</strong
          >
          其中的4个<u>授权</u>选项决定这个用户能够再授予其他用户的权限,并且所有你能授权的权限受限于你自己所在画廊被授予的权限.
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          某个管理身份的用户,ta的上限即是[授权这个管理身份],
          举个例子,一个用户有前面<strong
            class="font-medium text-gray-800 dark:text-white"
            >7</strong
          >项权限,那么ta至少是<strong
            class="font-medium text-gray-800 dark:text-white"
            >管理员</strong
          >身份,若ta有前面<strong class="font-medium text-gray-800 dark:text-white"
            >8</strong
          >项权限,那ta将不仅仅是<strong
            class="font-medium text-gray-800 dark:text-white"
            >管理员</strong
          >,而升级成了admin,即使ta不能再任命别的人为admin,最多授权别的人前7项选项.
        </p>

        
        <div class="edit-form py-4">

          <label for="price" class="block text-sm font-medium text-gray-700 mb-2"
            >权限细节</label
          >
          <div class="privilege-checkboxes flex">
            <div v-for="(p, idx) in pvllist" class="box-item cursor-pointer" @click="checkBox($event)">
              <input
                type="checkbox"
                class="pointer-events-none"
                :disabled="!(ableToGrant&(0b1<<idx))"
                :class="{'bg-gray-400':!(ableToGrant&(0b1<<idx))}"
                />
              <div class="box-detail pointer-events-none">{{ p }}</div>
            </div>
          </div>

          <div
            v-if="widgetinfo.activeIndex"
            class="flex items-end">
            <div class="mt-2 flex-initial mr-4">
              <label for="price" class="block text-sm font-medium text-gray-700"
              alt="当你选择了一个低权限身份,上面又勾选了不符的高权选项时,会自动取消勾选"
                >Paint House id of this user</label
              >
              <div class="mt-1 relative rounded-md shadow-sm">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <span class="text-gray-500 sm:text-sm"> </span>
                </div>
                <input
                  type="text"
                  name="phId"
                  id="phId"
                  class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder=""
                />
                
                <div class="absolute inset-y-0 right-0 flex items-center">
                  <label for="position" class="sr-only">PH id</label>
                  
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-end">
            <div class="mt-2 flex-initial mr-4">
              <label for="price" class="block text-sm font-medium text-gray-700"
              alt="当你选择了一个低权限身份,上面又勾选了不符的高权选项时,会自动取消勾选"
                >Position</label
              >
              <div class="mt-1 relative rounded-md shadow-sm">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <span class="text-gray-500 sm:text-sm"> </span>
                </div>
                <input
                  disabled
                  type="text"
                  name="position"
                  id="position"
                  class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder=""
                />
                
                <div class="absolute inset-y-0 right-0 flex items-center">
                  <label for="position" class="sr-only">Currency</label>
                  <select
                    @change="setRole()"
                    id="position-select"
                    name="position"
                    class="w-24 focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                  >
                    <option
                      v-for="(n, index) in validRole">
                      {{ n }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          
          
            <div v-if="showW" class="mt-1 relative select-menu flex-auto" id="w-selector">
              <label for="price" class="block text-sm font-medium text-gray-700"
                >Warehouse</label
              >
              <button
                @click="toggleDropdown($event)"
                v-click-outside="closeDropdown"
                type="button" class="w-select-button max-w-sm relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
                <span class="flex items-center pointer-events-none">
                  <img src="/static/img/gallery.jpg" alt="" class="flex-shrink-0 h-4 w-4 rounded-full" style="transform: scale(1.5);">
                  <span id="w-select" class="ml-3 block truncate"> warehouse xx </span>
                </span>
                <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <!-- Heroicon name: solid/selector -->
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </span>
              </button>

              <ul class="hidden dropdown-menu opacity-0 absolute mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
                <!--
                  Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

                  Highlighted: "text-white bg-indigo-600", Not Highlighted: "text-gray-900"
                -->
                <li 
                  v-for="(w, index) in ws"
                  :wid="w.w_id"
                  class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 wh-opt"
                  id="listbox-option-0"
                  role="option"
                  @click="selectWarehouse($event)">
                  <div class="flex items-center pointer-events-none">
                    <img src="/static/img/gallery.jpg" alt="" class="flex-shrink-0 h-6 w-6 rounded-full">
                    <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
                    <span class="name font-normal ml-3 block truncate"> {{ w.name }} </span>
                  </div>

                  <!--
                    Checkmark, only display for selected option.

                    Highlighted: "text-white", Not Highlighted: "text-indigo-600"
                  -->
                  <span class="text-white absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <!-- Heroicon name: solid/check -->
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>                     
                </li>
                

                <!-- More items... -->
              </ul>
            </div>
          
            <!-- ws... -->
          </div>

          <div class="mt-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Status</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>
              <input
                disabled
                type="text"
                name="status_n"
                id="status"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder=""
              />
              
              <div class="absolute inset-y-0 right-0 flex items-center">
                <label for="status" class="sr-only">Status</label>
                <select
                  @change="setStatus($event)"
                  id="status"
                  name="status"
                  class="w-24 focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                >
                  <option v-for="(n, index) in statusname" >{{ n }}</option>
                  
                </select>
              </div>
            </div>
          </div>
          <div class="mt-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Date join</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>
              <input
                type="date"
                name="date_join"
                id="date_join"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-1 sm:text-sm border-gray-300 rounded-md"
                placeholder=""
              />
              <div class="absolute inset-y-0 right-0 flex items-center">
                <label for="date" class="sr-only">Date</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  

    <div class="hidden bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div class="sm:flex sm:items-start">
        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <!-- Heroicon name: outline/exclamation -->
          <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Edit xxx record</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
      <button
        v-if="!widgetinfo.activeIndex"
        @click="$emit('edit-staff', formData(0))"
        type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Update</button>
      <button
        v-if="!widgetinfo.activeIndex"
        @click="$emit('edit-staff', formData(2))"
        type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">Delete</button>
      
      <button
        v-if="widgetinfo.activeIndex"
        @click="$emit('edit-staff', formData(1))"
        type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Create</button>
      
      <button
        @click="$emit('close-edit')"
        type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
    </div>
    `,
};


let warehouse_edit_widget = {
  directives: {clickOutside},
  name: "warehouse-edit-widget",
  props: {
    user: Object,
    w: Object,
    g: String,
    ws: Array,
    gs: Array,
    userontargetg: Object,
    widgetinfo: Object,
  },
  data() {
    return {
      status: 0,
      m: -1,
      statusname: [
        'closed',
        'open',
        'under construction',
        'destroyed'
      ],
      base: [
        0b000001000000000,
        0b000000100000000,
        0b000000001000000,
        0b000000000001000,
      ],
      tip: `
      创建库房的权限 &lt; 修改or删除库房的权限,
        <strong class="font-medium text-gray-800 dark:text-white">
        因为能够修改即能够破坏达到删除的效果.
        </strong>最后,更改库房
        <strong class="font-medium text-gray-800 dark:text-white"
        所属的画廊
        </strong>
        意味着需要有在当前画廊的删除权限,以及另一个画廊的创建权限,这是逻辑上的安全限制.
      `,
      
    };
  },
  computed: {
    canChangeGallery(){
      if (this.userontargetg === undefined || this.user.user === undefined) return 0;
      return ( (this.user.user.privilege&0b000000000100000) && (this.userontargetg.privilege&0b000000000010000) )
    },
    canChangeW() {
      return this.user.user.privilege & 0b100000;
    },
    canCreateW() {
      return this.user.user.privilege & 0b10000;
    },
    canDeleteW() {
      return this.canChangeW;
    }
  },
  methods: {
    displayStatus(a) {
      return this.statusname[parseInt(a)]
    },
    toggleDropdown(e) {
      let tgt = $(e.target).next();
      if (!tgt.hasClass("opacity-100")) {
        tgt.addClass("opacity-100 z-10").removeClass('hidden');
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
    async selectGallery(e) {
      let opt = this.changeSelect(e);
      if (opt) {
        $('#g-select').text(opt.find('.name').text());
        this.$emit('get-userontargetg', $("#g-selector li.selected").attr('gid'));
      }
    },
    ifchangeG() {
      return ($("#g-selector li.selected").length) && 1;
    },
    getG(m) {
      if (m===1 && this.g != undefined) return this.g;
      if (this.canChangeGallery && $("#g-selector li.selected").length)
        return $("#g-selector li.selected").attr('gid');
      return ''
    },
    formData(m) {
      return {
        m: m,
        w: m==1?0: (this.w||{}).w_id || undefined,
        g: this.getG(m),
        info: JSON.stringify({
          name: $('[name="w-name"]').val(),
          status: this.statusname.indexOf($('select[name="status"]').val()),
          date_create: $('input#date_create').val(),
          date_add: $('input#date_add').val(),
        }),
      }
    }
  },
  mounted() {
  },
  emits: ['close-edit', 'edit-warehouse', 'get-userontargetg'],
  template: `
    <div id="myTabContent">
      <div
        class="p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
        id="profile"
        role="tabpanel"
        aria-labelledby="profile-tab"
      >
      <table
        v-if="w !== undefined"
        class="block max-h-96 overflow-auto min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created/Added</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temporary Staff Num</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Art Num</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            :wid="w.w_id"
            >
            <td class="px-3 py-4 whitespace-normal">
              <div class="text-sm text-gray-900"> {{  w.name  }} </div>
              <div class="text-sm text-gray-500"> {{  w.w_id  }} </div>
            </td>
            <td class="px-3 py-4 whitespace-normal">
              <div class="text-sm text-gray-900"> {{  w.date_create  }} </div>
              <div class="text-sm text-gray-500">  {{  w.date_add  }} </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"> {{ displayStatus(w.status) }} </span>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500"> {{  w.temporary_staff_num  }} </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500"> {{  w.art_num  }} </td>
            <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
            </td>
          </tr>
        </tbody>
        </table>
        <p class="text-sm text-gray-500 dark:text-gray-400" v-html="tip">
        
        </p>
        
        <div class="edit-form py-4">
        <div class="flex items-end">
        <div class="mt-2 flex-initial mr-4">
          <label for="price" class="block text-sm font-medium text-gray-700"
            >Name</label
          >
          <div class="mt-1 relative rounded-md shadow-sm">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <span class="text-gray-500 sm:text-sm"> </span>
            </div>
            <input
              type="text"
              name="w-name"
              id="w-name"
              class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder=""
            />  
            
          </div>
        </div>
      
      
        <div v-if="1" class="mt-1 relative select-menu flex-auto" id="g-selector">
          <label for="price" class="block text-sm font-medium text-gray-700"
            >Move to Another Gallery</label
          >
          <button
            @click="toggleDropdown($event)"
            v-click-outside="closeDropdown"
            type="button" class="g-select-button max-w-sm relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
            <span class="flex items-center pointer-events-none">
              <img src="/static/img/gallery.jpg" alt="" class="flex-shrink-0 h-4 w-4 rounded-full" style="transform: scale(1.5);">
              <span id="g-select" class="ml-3 block truncate"> don't move </span>
            </span>
            <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <!-- Heroicon name: solid/selector -->
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </span>
          </button>

          <ul class="hidden dropdown-menu opacity-0 absolute mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
            <!--
              Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

              Highlighted: "text-white bg-indigo-600", Not Highlighted: "text-gray-900"
            -->
            <li 
              v-for="(g, index) in gs"
              :gid="g.galleryId"
              class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 wh-opt"
              id="listbox-option-0"
              role="option"
              @click="selectGallery($event)">
              <div class="flex items-center pointer-events-none">
                <img src="/static/img/gallery.jpg" alt="" class="flex-shrink-0 h-6 w-6 rounded-full">
                <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
                <span class="name font-normal ml-3 block truncate"> {{ g.name }} </span>
              </div>

              <!--
                Checkmark, only display for selected option.

                Highlighted: "text-white", Not Highlighted: "text-indigo-600"
              -->
              <span class="text-white absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <!-- Heroicon name: solid/check -->
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </span>                     
            </li>
            

            <!-- More items... -->
          </ul>
        </div>
      
        <!-- gs... -->
      </div>

          <div class="mt-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Status</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>
              <input
                disabled
                type="text"
                name="status_n"
                id="status"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder=""
              />
              
              <div class="absolute inset-y-0 right-0 flex items-center">
                <label for="status" class="sr-only">Status</label>
                <select
                  @change=""
                  name="status"
                  class="w-24 focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                >
                  <option v-for="(n, index) in statusname" >{{ n }}</option>
                  
                </select>
              </div>
            </div>
          </div>
          <div class="mt-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Date create</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>
              <input
                type="date"
                name="date_create"
                id="date_create"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-1 sm:text-sm border-gray-300 rounded-md"
                placeholder=""
              />
              <div class="absolute inset-y-0 right-0 flex items-center">
                <label for="date" class="sr-only">Date</label>
              </div>
            </div>
          </div>
          <div class="mt-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Date_add</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>
              <input
                type="date"
                name="date_add"
                id="date_add"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-1 sm:text-sm border-gray-300 rounded-md"
                placeholder=""
              />
              <div class="absolute inset-y-0 right-0 flex items-center">
                <label for="date" class="sr-only">Date</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  

    <div class="hidden bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div class="sm:flex sm:items-start">
        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <!-- Heroicon name: outline/exclamation -->
          <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Edit xxx record</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
      <button
        v-if="!widgetinfo.activeIndex"
        @click="$emit('edit-warehouse', formData(0))"
        type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Update</button>
      <button
        v-if="!widgetinfo.activeIndex"
        @click="$emit('edit-warehouse', formData(2))"
        type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">Delete</button>
          
      <button
        v-if="widgetinfo.activeIndex"
        @click="$emit('edit-warehouse', formData(1))"
        type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Create</button>
        
      <button
        @click="$emit('close-edit')"
        type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
    </div>
    `,
};

let art_variable;
let art_edit_widget = {
  directives: {clickOutside},
  name: "art-edit-widget",
  props: {
    gs: Array,
    art: Object,
    widgetinfo: Object,
  },
  data() {
    return {
      userFromW: undefined,
      userToW: undefined,
      ws: [],
      status: 0,
      m: -1,
      statusname: [
        '损坏',
        '在馆藏',
        '运输中',
        '出借',
        '借入',
        '已售',
      ],
      base: [
        0b000001000000000,
        0b000000100000000,
        0b000000001000000,
        0b000000000001000,
      ],
      picture_name: '',
      picture_file: undefined,
    };
  },
  computed: {
    artPicUrl() {
      return ((this.art||{}).picture instanceof Blob)? URL.createObjectURL(this.art.picture) : '';
    },
    canChangeGallery(){
      if (this.user.userontargetg === undefined || this.user.user === undefined) return 0;
      return ( (this.user.user.privilege&0b000000000100000) && (this.user.userontargetg.privilege&0b000000000010000) )
    },
    canChangeW() {
      return this.user.user.privilege & 0b100000;
    },
    canCreateW() {
      return this.user.user.privilege & 0b10000;
    },
    canDeleteW() {
      return this.canChangeW;
    }
  },
  methods: {
    clearImgInput() {
      $('input#picture').val('');
      $('img#picture-preview-img').attr('src',this.artPicUrl);
      this.picture_file = undefined;
      this.picture_name = '';
    },
    toggleDropdown(e) {
      let tgt = $(e.target).next();
      if (!tgt.hasClass("opacity-100")) {
        tgt.addClass("opacity-100 z-10").removeClass('hidden');
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
    async fetchW(g) {
      const d = await getWarehouse(g)
        .done(function (data, textStatus, xhr) {
          
          // console.log(xhr.status); // 200
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
        });
      let data = "[" + d.replaceAll("}{", "},{").replaceAll("'", '"') + "]";
      data = await JSON.parse(data);
      this.ws = data;

    },
    async selectGallery(e) {
      let opt = this.changeSelect(e);
      if (opt) {
        $('#g-select').text(opt.find('.name').text());
        this.fetchW($("#g-selector li.selected").attr('gid'));
      }
    },
    async selectWarehouse(e) {
      let opt = this.changeSelect(e);
      if (opt) {
        $('#w-select').text(opt.find('.name').text());
      }
    },
    ifchangeG() {
      return ($("#g-selector li.selected").length) && 1;
    },
    formData(m) {
      d = {
        m: m,
        w: (m!=2 && ($("#w-selector li.selected").length)) ? $("#w-selector li.selected").attr('wid') : '',
        info: JSON.stringify({
          id: m==1 ? '': this.art.id ,
          name: $('[name="a-name"]').val(),
          status: this.statusname.indexOf($('select[name="status"]').val()),
          date_made: $('input#date_made').val(),
          date_add: $('input#date_add').val(),
        }),
      }
      var form_data = new FormData();
      for ( var v in d ) {
        form_data.append(v, d[v]);
      }
      if (m === 2 || this.picture_file === undefined) return form_data;
      form_data.append('picture', this.picture_file);
      return form_data;
    },
    readImage(e) {
      let f = e.target.files;
      if (FileReader && f && f.length) {
        art_variable = this.picture_file;
        this.picture_file = f[0];
        this.picture_name = f[0].name;
        var fr = new FileReader();
        fr.onload = function () {
            document.getElementById('picture-preview-img').src = fr.result;
        }
        fr.readAsDataURL(f[0]);
      }
    },
    
  },
  mounted() {
  },
  emits: ['close-edit', 'edit-art'],
  template: `
    <div id="myTabContent">
      <div
        class="p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
        id="profile"
        role="tabpanel"
        aria-labelledby="profile-tab"
      >
      <table
        v-if="art !== undefined"
        class="block max-h-96 overflow-auto min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Art</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gallery</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created/Added</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rack</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            :aid="art.id"
            >
            <td class="px-3 py-4 whitespace-normal">
              <div class="text-sm text-gray-900"> {{  art.name  }} </div>
              <div class="text-sm text-gray-500"> {{  art.id  }} </div>
            </td>
            <td class="px-3 py-4 whitespace-normal">
              <div class="text-sm text-gray-900"> {{  art.gallery  }} </div>
              <div class="text-sm text-gray-500">  {{  art.galleryId  }} </div>
            </td>
            <td class="px-3 py-4 whitespace-normal">
              <div class="text-sm text-gray-900"> {{  art.wh_name  }} </div>
              <div class="text-sm text-gray-500">  {{  art.wh_id  }} </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500"> {{  art.author  }} </td>
            <td class="px-3 py-4 whitespace-normal">
              <div class="text-sm text-gray-900"> {{  art.date_made  }} </div>
              <div class="text-sm text-gray-500">  {{  art.date_add  }} </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500"> {{  art.rack  }} </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"> {{ statusname[art.status] }} </span>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
            </td>
          </tr>
        </tbody>
        </table>
        <p class="text-sm text-gray-500 dark:text-gray-400" >
        
        </p>
        
        <div class="edit-form py-4">

          <div class="my-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Picture</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>

              <div class="file has-name is-fullwidth ">
                <label class="file-label text-sm">
                  <input type="file" accept="image/png, image/jpg, image/jpeg, image/webp"
                    @change="readImage($event)"
                    name="picture"
                    id="picture"
                    class="file-input"
                    placeholder=""
                  />
                  <span class="file-cta">
                    <span class="file-icon">
                      <i class="fas fa-upload"></i>
                    </span>
                    <span v-if="!picture_file" class="file-label">
                      Choose Image…
                    </span>
                    <span v-else class="file-label">
                      Image :
                    </span>
                  </span>
                  <span class="file-name">
                  {{ picture_name }}
                  <button
                    @click="clearImgInput()"
                    class="mx-auto my-0 top-0 h-full border-solid absolute right-0 px-2 py-auto border-l border-gray-300">Cancel</button>
                  </span>
                </label>
              </div>

              <div class="w-full">
                <img
                  class="mx-auto h-24"
                  id="picture-preview-img"
                  :src="artPicUrl"
                >
              </div>
            </div>
          </div>
          <div class="my-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Name</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>
              <input
                type="text"
                name="a-name"
                id="a-name"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder=""
              />  
              
            </div>
          </div>

          <div class="flex items-baseline">
          
            <div v-if="1" class="my-1 mr-2 relative select-menu flex-1" id="g-selector">
              <label for="price" class="block text-sm font-medium text-gray-700"
                >Gallery</label
              >
              <button
                @click="toggleDropdown($event)"
                v-click-outside="closeDropdown"
                type="button" class="box-border g-select-button max-w-sm relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
                <span class="flex items-center pointer-events-none">
                  <img src="/static/img/gallery.jpg" alt="" class="flex-shrink-0 h-4 w-4 rounded-full" style="transform: scale(1.5);">
                  <span id="g-select" class="ml-3 block truncate"> choose g </span>
                </span>
                <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <!-- Heroicon name: solid/selector -->
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </span>
              </button>

              <ul class="hidden absolute mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
                <!--
                  Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

                  Highlighted: "text-white bg-indigo-600", Not Highlighted: "text-gray-900"
                -->
                <li 
                  v-for="(g, index) in gs"
                  :gid="g.galleryId"
                  class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 wh-opt"
                  id="listbox-option-0"
                  role="option"
                  @click="selectGallery($event)">
                  <div class="flex items-center pointer-events-none">
                    <img src="/static/img/gallery.jpg" alt="" class="flex-shrink-0 h-6 w-6 rounded-full">
                    <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
                    <span class="name font-normal ml-3 block truncate"> {{ g.name }} </span>
                  </div>

                  <!--
                    Checkmark, only display for selected option.

                    Highlighted: "text-white", Not Highlighted: "text-indigo-600"
                  -->
                  <span class="text-white absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <!-- Heroicon name: solid/check -->
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>                     
                </li>
                

                <!-- More items... -->
              </ul>
            </div>

            <div v-if="1" class="my-1 mr-2 relative select-menu flex-1" id="w-selector">
              <label for="price" class="block text-sm font-medium text-gray-700"
                >warehouse</label
              >
              <button
                @click="toggleDropdown($event)"
                v-click-outside="closeDropdown"
                type="button" class="box-border g-select-button max-w-sm relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
                <span class="flex items-center pointer-events-none">
                  <img src="/static/img/warehouse.png" alt="" class="flex-shrink-0 h-4 w-4 rounded-full" style="transform: scale(1.5);">
                  <span id="w-select" class="ml-3 block truncate"> choose w </span>
                </span>
                <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <!-- Heroicon name: solid/selector -->
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </span>
              </button>

              <ul class="hidden absolute mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
                <!--
                  Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

                  Highlighted: "text-white bg-indigo-600", Not Highlighted: "text-gray-900"
                -->
                <li 
                  v-for="(w, index) in ws"
                  :wid="w.w_id"
                  class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 wh-opt"
                  id="listbox-option-0"
                  role="option"
                  @click="selectWarehouse($event)">
                  <div class="flex items-center pointer-events-none">
                    <img src="/static/img/warehouse.png" alt="" class="flex-shrink-0 h-6 w-6 rounded-full">
                    <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
                    <span class="name font-normal ml-3 block truncate"> {{ w.name }} </span>
                  </div>

                  <!--
                    Checkmark, only display for selected option.

                    Highlighted: "text-white", Not Highlighted: "text-indigo-600"
                  -->
                  <span class="text-white absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <!-- Heroicon name: solid/check -->
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>                     
                </li>
                

                <!-- More items... -->
              </ul>
            </div>
            <!-- ws... -->
          </div>

          <div class="my-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Status</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>
              <input
                disabled
                type="text"
                name="status_n"
                id="status"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder=""
              />
              
              <div class="absolute inset-y-0 right-0 flex items-center">
                <label for="status" class="sr-only">Status</label>
                <select
                  @change=""
                  name="status"
                  class="w-24 focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                >
                  <option v-for="(n, index) in statusname" >{{ n }}</option>
                  
                </select>
              </div>
            </div>
          </div>
          <div class="my-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Rack</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>
              <input
                type="text"
                name="rack"
                id="rack"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder=""
              />  
              
            </div>
          </div>
          <div class="my-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Date made</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>
              <input
                type="date"
                name="date_made"
                id="date_made"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-1 sm:text-sm border-gray-300 rounded-md"
                placeholder=""
              />
              <div class="absolute inset-y-0 right-0 flex items-center">
                <label for="date" class="sr-only">Date</label>
              </div>
            </div>
          </div>
          <div class="mt-2">
            <label for="price" class="block text-sm font-medium text-gray-700"
              >Date_add</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm"> </span>
              </div>
              <input
                type="date"
                name="date_add"
                id="date_add"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-2 pr-1 sm:text-sm border-gray-300 rounded-md"
                placeholder=""
              />
              <div class="absolute inset-y-0 right-0 flex items-center">
                <label for="date" class="sr-only">Date</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  

    <div class="hidden bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div class="sm:flex sm:items-start">
        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <!-- Heroicon name: outline/exclamation -->
          <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Edit xxx record</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
      <button
        v-if="!widgetinfo.activeIndex"
        @click="$emit('edit-art', formData(0))"
        type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Update</button>
      
      <button
        v-if="!widgetinfo.activeIndex"
        @click="$emit('edit-art', formData(2))"
        type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">Delete</button>
      
      <button
        v-if="widgetinfo.activeIndex"
        @click="$emit('edit-art', formData(1))"
        type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
        Create
      </button>
          
      <button
        @click="$emit('close-edit')"
        type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
    </div>
    `,
};
