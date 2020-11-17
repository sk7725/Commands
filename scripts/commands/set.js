const cmdList = ["setblock", "setfloor", "setoverlay", "fill", "clone"];
const modeList = ["replace", "keep", "destroy", "force"];

const cmdCategory = this.global.cmdCategory;

//partial credits to DeltaNedas
const SetblockI = {
  _(builder, cmd, ax, ay, ab, ar, at, a1, a2, a3) {
    this.cmd = builder.var(cmd);
    this.ax = builder.var(ax);
    this.ay = builder.var(ay);
    this.ab = builder.var(ab);
    this.ar = builder.var(ar);
    this.at = builder.var(at);
    this.a1 = builder.var(a1);
    this.a2 = builder.var(a2);
    this.a3 = builder.var(a3);
  },

  run(vm) {
    const cmd = vm.numi(this.cmd);

    var block = vm.obj(this.ab);
    var cx = vm.numi(this.ax);
    var cy = vm.numi(this.ay);

    if(block == null || vm.vars[this.ax].isobj || vm.vars[this.ay].isobj || cx < 0 || cy < 0 || cx >= Vars.world.width() || cy >= Vars.world.height()) return;
    if(!(block instanceof Block)) return;

    var tile = Vars.world.tile(cx, cy);
    if(tile == null) return;

    switch(cmd){
      case 0:
        var team = Team.get(vm.numi(this.at));
        var mode = vm.numi(this.a1);
        if(block.name == "air" && mode == 1) return;
        var rot = vm.numi(this.ar) % 4;
        if(rot < 0) rot += 4;
        if(tile.block() == block && (tile.build == null || (tile.build.team == team && (tile.build.rotation == rot ||(block instanceof Turret))))){
          vm.setobj(this.a2, tile.build);
          return;
        }

        if(mode == 1 && !checkEmpty(tile, block.size)) return;
        if(mode == 2 && tile.build != null){
          //break old block
          tile.build.kill();
          if(block.name != "air") tile.setBlock(block, team, rot);
          tile = Vars.world.tile(cx, cy);
          vm.setobj(this.a2, tile.build);
        }
        else{
          //setblock
          tile.setBlock(block, team, rot);
          tile = Vars.world.tile(cx, cy);
          vm.setobj(this.a2, tile.build);
        }
      break;
      default:

      //end
    }
  },
  checkEmpty(tile, size){
    if(size <= 1) return tile.block().name == "air";
    var off = Mathf.floorPositive((size - 1)/2);
    var end = Mathf.floorPositive(size / 2);
    for(var i = -1*off; i <= end; i++){
      for(var j = -1*off; j <= end; j++){
        if(tile.nearby(i, j).block().name != "air") return false;
      }
    }
    return true;
  }
};

const SetblockStatement = {
  new: words => {
    const st = extend(LStatement, Object.create(SetblockStatement));
    st.read(words);
    return st;
  },

  read(words) {
    this.cmd = (isNaN(Number(words[1]))) ? cmdList.indexOf(words[1]) : words[1];
    this.ax = words[2];
    this.ay = words[3];
    this.ab = words[4];
    this.ar = words[5];
    this.at = words[6];
    this.a1 = (this.cmd == 0) ? ((isNaN(Number(words[7]))) ? modeList.indexOf(words[7]) : words[7]) : words[7];
    this.a2 = words[8];
    this.a3 = words[9];
  },

  build(h) {
    if (h instanceof Table) {
      return this.buildt(h);
    }

    const inst = extend(LExecutor.LInstruction, Object.create(SetblockI));
    inst._(h, this.cmd, this.ax, this.ay, this.ab, this.ar, this.at, this.a1, this.a2, this.a3);
    return inst;
  },

  buildt(table) {
    //todo dropdown
    table.clearChildren();//this just sounds horrible


    switch(Number(this.cmd)){
      case 0:
      case 1:
      case 2:
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          this.fieldlist(t, cmdList, this.cmd, "cmd", table);
          this.fields(t, "x", this.ax, text => {this.ax = text});
          this.fields(t, "y", this.ay, text => {this.ay = text});
          if(!LCanvas.useRows()){
            t.left();
            t.setColor(table.color);
            this.fields(t, "block", this.ab, text => {this.ab = text});
            if(this.cmd == 0) this.fields(t, "rotation", this.ar, text => {this.ar = text});
          }
        })).left();

        if(LCanvas.useRows()){
          this.row(table);
          table.table(cons(t => {
            t.left();
            t.setColor(table.color);
            this.fields(t, "block", this.ab, text => {this.ab = text});
            if(this.cmd == 0) this.fields(t, "rotation", this.ar, text => {this.ar = text});
          })).left();
        }

        if(this.cmd != 0) break;

        table.row();

        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          if(!LCanvas.useRows()) t.add().width(120);
          this.fields(t, "team", this.at, text => {this.at = text});
          this.fieldlist(t, modeList, this.a1, "a1", table).width(85);
          this.row(t);
          this.fields(t, "building", this.a2, text => {this.a2 = text}).left();
        })).left();

      break;

      case 3:
        //fill(idk if yey or nay)
        this.fieldlist(table, cmdList, this.cmd, "cmd", table);
      break;
      case 4:
        //clone(shallow copy)
        this.fieldlist(table, cmdList, this.cmd, "cmd", table);
      break;

      default:
        this.fieldlist(table, cmdList, this.cmd, "cmd", table);
        this.row(table);
        table.add("[lightgray]invalid command[]");
    }

  },

  fieldlist(table, list, def, defname, parent){
    var b = new Button(Styles.logict);
    //var n = Number(def);
    //if(isNaN(n) || n < 0 || n >= list.length) this[defname] = 0;
    b.label(prov(() => ((defname == "cmd")?"/":"") + list[Number(def)]));
    b.clicked(() => this.showSelect(b, list, list[Number(def)], t => {
        this[defname] = list.indexOf(t);
        if(parent !== false) this.buildt(parent);
    }, 2, cell => cell.size(100, 50)));
    return table.add(b).size(120, 40).color(table.color).left().padLeft(2);
  },

  write(builder) {
    builder.append("cmdset " + cmdList[this.cmd] + "");
    builder.append(" ");
    builder.append(this.ax + "");
    builder.append(" ");
    builder.append(this.ay + "");
    builder.append(" ");
    builder.append(this.ab + "");
    builder.append(" ");
    builder.append(this.ar + "");
    builder.append(" ");
    builder.append(this.at + "");
    builder.append(" ");
    builder.append((this.cmd == 0) ? modeList[this.a1] + "" : (this.a1 + ""));
    builder.append(" ");
    builder.append(this.a2 + "");
    builder.append(" ");
    builder.append(this.a3 + "");
  },

  name: () => "Command: Set",
  color: () => cmdCategory
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("cmdset", func(SetblockStatement.new));

LogicIO.allStatements.add(prov(() => SetblockStatement.new([
  "cmdset",
  "setblock",
  "0",
  "0",
  "block",
  "0",
  "1",
  "0",
  "result",
  "0"
])));
