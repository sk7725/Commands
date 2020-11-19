const contentList = ["block", "item", "unit", "liquid", "bullet", "effect", "status", "weather", "sound", "color"];
const typeList = ["name", "id"];
const colorTypeList = ["name", "hex", "rgb", "hsv"];

const soundArr = Object.keys(Sounds).filter(s => (typeof Sounds[s]) == "object").sort();
const arrc = Object.keys(Color).filter(s => (typeof Color[s]) == "object").sort();
const arrp = Object.keys(Pal).filter(s => (typeof Pal[s]) == "object").sort();
const fxArr = Object.keys(Fx).filter(s => (typeof Fx[s]) == "object");

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
      var type = vm.numi(this.type);
      if(type == 0){
        try{
          vm.setobj(this.res, Bullets[vm.obj(this.val) + ""]);
        }
        catch(notFound){
          vm.setobj(this.res, null);
        }
      }
      else vm.setobj(this.res, Vars.content.getByID(ContentType.bullet, vm.numi(this.val)));
    }
    else if(cont == 5){
      vm.setobj(this.res, fxArr.indexOf(vm.obj(this.val) + "") > -1 ? vm.obj(this.val) : null);
    }
    else if(cont == 8){
      //Sound, this is cheating ik
      var tmpid = 0;
      if(vm.numi(this.type) != 0) tmpid = vm.numi(this.val);
      else tmpid = soundArr.indexOf(vm.obj(this.val) + "");
      if(tmpid < 0 || tmpid >= soundArr.length) vm.setobj(this.res, null);
      else vm.setobj(this.res, soundArr[tmpid]);
    }
    else if(cont == 9){
      //Color
      var type = vm.numi(this.type);
      if(type == 0){
        //name
        var color = vm.obj(this.val) + "";
        try{
          if(arrc.indexOf(color) > -1) vm.setobj(this.res, Color[color].toString());
          else if(arrp.indexOf(color) > -1) vm.setobj(this.res, Pal[color].toString());
        }
        catch(invalidColor){}
      }
      else if(type == 1){
        var color = vm.obj(this.val) + "";
        //if(color.length > 7 || color.length < 6) return;//ewww color
        try{
          vm.setobj(this.res, Color.valueOf(color).toString());
        }
        catch(invalidColor){}
      }
      else if(type == 2){
        //rgb
        vm.setobj(this.res, Color.rgb(vm.numi(this.val), vm.numi(this.vg), vm.numi(this.vb)).toString());
      }
      else if(type == 3){
        //hsv
        vm.setobj(this.res, Tmp.c1.set(1, 1, 1, 1).fromHsv(vm.numi(this.val), vm.numi(this.vg), vm.numi(this.vb)).toString());
      }
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
    this.cont = (isNaN(Number(words[2]))) ? contentList.indexOf(words[2]) : words[2];
    if(this.cont == 5) this.type = words[3];
    else if(this.cont == 9) this.type = (isNaN(Number(words[3]))) ? colorTypeList.indexOf(words[3]) : words[3];
    else this.type = (isNaN(Number(words[3]))) ? typeList.indexOf(words[3]) : words[3];
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

    table.table(cons(t => {
      t.left();
      t.setColor(table.color);
      this.field(t, this.res, text => {this.res = text}).width(85);
      t.add(" = ");
      this.fieldlist(t, contentList, this.cont, "cont", table, 120);
    })).left();

    this.row(table);

    if(this.cont == 9){
      table.table(cons(t => {
        t.left();
        t.setColor(table.color);
        t.add(" getby");
        this.fieldlist(t, colorTypeList, this.type, "type", table, 85);
        if(this.type == 0 || this.type == 1){
          //if(this.type == 1) table.add(" #");
          this.field(t, this.val, text => {this.val = text}).width(180).left();
        }
      })).left();

      this.row(table);

      if(this.type == 2){
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          this.fields(t, "r", this.val, text => {this.val = text});
          this.fields(t, "g", this.vg, text => {this.vg = text});
          this.fields(t, "b", this.vb, text => {this.vb = text});
        })).left();
      }
      else if(this.type == 3){
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          this.fields(t, "h", this.val, text => {this.val = text});
          this.fields(t, "s", this.vg, text => {this.vg = text});
          this.fields(t, "v", this.vb, text => {this.vb = text});
        })).left();
      }
    }
    else{
      table.table(cons(t => {
        t.left();
        t.setColor(table.color);
        t.add(" getby");
        if(this.cont == 5) this.fakelist(t, "name", 85);
        else this.fieldlist(t, typeList, this.type, "type", table, 85);
        //this.row(table);
        this.field(t, this.val, text => {this.val = text}).width(180);
      })).left();
    }
  },

  fieldlist(table, list, def, defname, parent, w){
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

  fakelist(table, name, w){
    var b = new Button(Styles.logict);
    b.label(prov(() => name));
    b.clicked(() => {});
    table.add(b).size(w, 40).color(table.color).left().padLeft(2);
  },

  write(builder) {
    builder.append("getcont " + this.res + "");
    builder.append(" ");
    builder.append(contentList[this.cont] + "");
    builder.append(" ");
    if(this.cont == 5) builder.append("name");
    else if(this.cont == 9) builder.append(colorTypeList[this.type] + "");
    else builder.append(typeList[this.type] + "");

    builder.append(" ");
    builder.append(this.val + "");
    builder.append(" ");
    builder.append(this.vg + "");
    builder.append(" ");
    builder.append(this.vb + "");
  },

  name: () => "Get Content",
  color: () => Pal.logicOperations
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
