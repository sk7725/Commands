const typeList = ["building", "block", "overlay", "floor", "width", "height", "solid?", "passable?", "synthetic?", "drop"];//? hopefully implies boolean

//partial credits to DeltaNedas
const GetWorldI = {
  _(builder, res, type, ax, ay) {
    this.res = builder.var(res);
    this.type = builder.var(type);
    this.ax = builder.var(ax);
    this.ay = builder.var(ay);
  },

  run(vm) {
    var type = vm.numi(this.type);
    switch(type){
      case 4:
      vm.setnum(this.res, Vars.world.width());
      break;
      case 5:
      vm.setnum(this.res, Vars.world.height());
      break;

      case 0:
      vm.setobj(this.res, Vars.world.build(vm.numi(this.ax), vm.numi(this.ay)));
      break;
      case 1:
      var tile = Vars.world.tile(vm.numi(this.ax), vm.numi(this.ay));
      vm.setobj(this.res, (tile == null) ? null : tile.block());
      break;
      case 2:
      var tile = Vars.world.tile(vm.numi(this.ax), vm.numi(this.ay));
      vm.setobj(this.res, (tile == null) ? null : tile.overlay());
      break;
      case 3:
      var tile = Vars.world.tile(vm.numi(this.ax), vm.numi(this.ay));
      vm.setobj(this.res, (tile == null) ? null : tile.floor());
      break;

      case 6:
      vm.setbool(this.res, Vars.world.solid(vm.numi(this.ax), vm.numi(this.ay)));
      break;
      case 7:
      vm.setbool(this.res, Vars.world.passable(vm.numi(this.ax), vm.numi(this.ay)));
      break;

      case 8:
      var tile = Vars.world.tile(vm.numi(this.ax), vm.numi(this.ay));
      vm.setbool(this.res, (tile == null) ? false : tile.synthetic());
      break;
      case 9:
      var tile = Vars.world.tile(vm.numi(this.ax), vm.numi(this.ay));
      vm.setobj(this.res, (tile == null) ? null : tile.drop());
      break;
    }
  }
};

const GetWorldStatement = {
  new: words => {
    const st = extend(LStatement, Object.create(GetWorldStatement));
    st.read(words);
    return st;
  },

  read(words) {
    this.res = words[1];
    this.type = (isNaN(Number(words[2]))) ? typeList.indexOf(words[2]) : words[2];
    this.ax = words[3];
    this.ay = words[4];
  },

  build(h) {
    if (h instanceof Table) {
      return this.buildt(h);
    }

    const inst = extend(LExecutor.LInstruction, Object.create(GetWorldI));
    inst._(h, this.res, this.type, this.ax, this.ay);
    return inst;
  },

  buildt(table) {
    table.clearChildren();

    table.table(cons(t => {
      t.left();
      t.setColor(table.color);
      this.field(t, this.res, text => {this.res = text}).width(85);
      t.add(" = ");
      this.fieldlist(t, typeList, this.type, "type", table).width(120);
    })).left();

    if(this.type == 4 || this.type == 5) return;

    this.row(table);
    table.table(cons(t => {
      t.left();
      t.setColor(table.color);
      this.fields(t, "x", this.ax, text => {this.ax = text});
      this.fields(t, "y", this.ay, text => {this.ay = text});
    })).left();
  },

  fieldlist(table, list, def, defname, parent){
    var b = new Button(Styles.logict);
    b.label(prov(() => ((defname == "cmd")?"/":"") + list[Number(def)]));
    b.clicked(() => this.showSelect(b, list, list[Number(def)], t => {
        this[defname] = list.indexOf(t);
        if(parent !== false) this.buildt(parent);
    }, 2, cell => cell.size(100, 50)));
    return table.add(b).size(85, 40).color(table.color).left().padLeft(2);
  },

  fakelist(table, name){
    var b = new Button(Styles.logict);
    b.label(prov(() => name));
    b.clicked(() => {});
    return table.add(b).size(85, 40).color(table.color).left().padLeft(2);
  },

  write(builder) {
    builder.append("world " + this.res + "");
    builder.append(" ");
    builder.append(typeList[this.type] + "");
    builder.append(" ");
    builder.append(this.ax + "");
    builder.append(" ");
    builder.append(this.ay + "");
  },

  name: () => "World",
  color: () => Pal.logicBlocks
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("world", func(GetWorldStatement.new));

LogicIO.allStatements.add(prov(() => GetWorldStatement.new([
  "world",
  "result",
  "building",
  "0",
  "0"
])));
