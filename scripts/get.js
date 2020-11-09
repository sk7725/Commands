const contentList = ["block", "item", "unit", "liquid", "bullet", "effect", "status", "weather", "sound", "color"];
const typeList = ["name", "id"];
const colorTypeList = ["name", "hex", "rgb", "hsv"];

//this.global.cmdCategory = LCategory.blocks;
//const cmdCategory = this.global.cmdCategory;

//partial credits to DeltaNedas
const GetContI = {
  _(builder, res, cont, type, val, vg, vb) {
    this.res = builder.var(res);
    this.cont = builder.var(cont);
    this.type = builder.var(type);
    this.val = builder.var(val);
    this.vg = builder.var(vg);
    this.vb = builder.var(vb);
  },

  run(vm) {
    const cont = Number(vm.numi(this.cont));

    if((0 <= cont && cont < 4) || cont == 6 || cont == 7){
      //getbyname & getbyid
      var type = vm.numi(this.type);
      vm.setobj(this.res, (type == 0) ? Vars.content.getByName(ContentType[contentList[cont]], vm.obj(this.val) + "") : Vars.content.getByID(ContentType[contentList[cont]], vm.numi(this.val)));
    }
    else if(cont == 4){
      //Bullet
    }
    else if(cont == 5){
      //Fx
    }
    else if(cont == 8){
      //Sound, this is cheating ik
      var arr = Object.keys(Sounds).filter(s => (typeof s) == "object");
      print(arr.join(", "));
      vm.setobj(this.res, (vm.numi(this.type) == 0) ? vm.obj(this.val) + "" : arr[vm.numi(this.val)] + "");
    }
    else if(cont == 9){
      //Color
    }
  }
};

const GetContStatement = {
  new: words => {
    const st = extend(LStatement, Object.create(GetContStatement));
    st.read(words);
    return st;
  },

  read(words) {
    this.res = words[1];
    this.cont = words[2];
    this.type = words[3];
    this.val = words[4];
    this.vg = words[5];
    this.vb = words[6];
  },

  build(h) {
    if (h instanceof Table) {
      return this.buildt(h);
    }

    const inst = extend(LExecutor.LInstruction, Object.create(GetContI));
    inst._(h, this.res, this.cont, this.type, this.val, this.vg, this.vb);
    return inst;
  },

  buildt(table) {
    //todo dropdown
    table.clearChildren();//this just sounds horrible

    this.field(table, this.res, text => {this.res = text}).width(90);
    table.add(" = ");
    this.fieldlist(table, contentList, this.cont, "cont", table, 120);
    this.row(table);

    if(this.cont == 9){
      table.add(" getby");
      this.fieldlist(table, colorTypeList, this.type, "type", table, 85);
      this.row(table);
      if(this.type == 0 || this.type == 1){
        if(this.type == 1) table.add(" #");
        this.field(table, this.val, text => {this.val = text}).width(180);
      }
      else if(this.type == 2){
        this.fields(table, "r", this.val, text => {this.val = text});
        this.fields(table, "g", this.vg, text => {this.vg = text});
        this.fields(table, "b", this.vb, text => {this.vb = text});
      }
      else if(this.type == 3){
        this.fields(table, "h", this.val, text => {this.val = text});
        this.fields(table, "s", this.vg, text => {this.vg = text});
        this.fields(table, "v", this.vb, text => {this.vb = text});
      }
    }
    else{
      table.add(" getby");
      this.fieldlist(table, typeList, this.type, "type", table, 85);
      this.row(table);
      this.field(table, this.val, text => {this.val = text}).width(180);
    }
  },

  fieldlist(table, list, def, defname, parent, w){
    if(w === undefined) w = 120;
    var b = new Button(Styles.logict);
    //var n = Number(def);
    //if(isNaN(n) || n < 0 || n >= list.length) this[defname] = 0;
    b.label(prov(() => ((defname == "cmd")?"/":"") + list[Number(def)]));
    b.clicked(() => this.showSelect(b, list, list[Number(def)], t => {
        this[defname] = list.indexOf(t);
        if(parent !== false) this.buildt(parent);
    }, 2, cell => cell.size(100, 50)));
    table.add(b).size(w, 40).color(table.color).left().padLeft(2);
  },

  write(builder) {
    builder.append("getcont " + this.res + "");
    builder.append(" ");
    builder.append(this.cont + "");
    builder.append(" ");
    builder.append(this.type + "");
    builder.append(" ");
    builder.append(this.val + "");
    builder.append(" ");
    builder.append(this.vg + "");
    builder.append(" ");
    builder.append(this.vb + "");
  },

  name: () => "Get Content",
  category: () => LCategory.operations
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("getcont", func(GetContStatement.new));

LogicIO.allStatements.add(prov(() => GetContStatement.new([
  "getcont",
  "result",
  "0",
  "0",
  '""',
  "0",
  "0"
])));
