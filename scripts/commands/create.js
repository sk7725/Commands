const cmdList = ["summon", "shoot", "fx", "playsound", "puddle"];//this playsound will at(), not play()

const cmdCategory = this.global.cmdCategory;

//partial credits to DeltaNedas
const CreateI = {
  _(builder, cmd, atype, ax, ay, ar, at, av, al, aowner) {
    this.cmd = builder.var(cmd);
    this.atype = builder.var(atype);
    this.ax = builder.var(ax);
    this.ay = builder.var(ay);
    this.ar = builder.var(ar);
    this.at = builder.var(at);
    this.av = builder.var(av);
    this.al = builder.var(al);
    this.aowner = builder.var(aowner);
  },

  run(vm) {
    const cmd = vm.numi(this.cmd);

    var type = vm.obj(this.atype);
    var cx = vm.num(this.ax) * Vars.tilesize;
    var cy = vm.num(this.ay) * Vars.tilesize;

    if(type == null || cx < 0 || cy < 0 || cx >= Vars.world.unitWidth() || cy >= Vars.world.unitHeight()) return;

    switch(cmd){
      case 0:
        if(!(type instanceof UnitType)) return;
        var team = Team.get(vm.numi(this.ar));
        var u = type.create(team);
        u.set(cx, cy);
        if(!Vars.net.client()) u.add();
      break;
      case 1:
        if(!(type instanceof BulletType)) return;
        var team = Team.get(vm.numi(this.at));
        //var owner = vm.obj(this.aowner);
        //if(owner == "" || owner == null || (typeof owner) != "object") owner = null;
        //else if(!(owner instanceof Entityc)) owner = null;
        var dmg = (vm.vars[this.aowner].isobj) ? -1 : vm.numf(this.aowner);
        type.create(null, team, cx, cy, vm.numf(this.ar), dmg, vm.numf(this.av), vm.numf(this.al), null);
      break;
      case 2:
        if(Vars.headless) return;
        var color = vm.obj(this.at);
        if((typeof color) == "string") color = Color.valueOf(color);
        else color = Color.white;
        //print("FX ("+cx+", "+cy+")");
        try{
          Fx[type + ""].at(cx, cy, vm.numf(this.ar), color);
        }
        catch(err){
          //print(err);
        }
      break;
      case 3:
        if(Vars.headless) return;
        try{
          Sounds[type + ""].at(cx, cy, vm.numf(this.ar), vm.numf(this.at));
        }
        catch(notFound){}
      break;
      case 4:
        if(!(type instanceof Liquid) || Vars.world.tileWorld(cx, cy) == null) return;
        Puddles.deposit(Vars.world.tileWorld(cx, cy), type, vm.numf(this.ar));
      break;
      default:

      //end
    }
  }
};

const CreateStatement = {
  new: words => {
    const st = extend(LStatement, Object.create(CreateStatement));
    st.read(words);
    return st;
  },

  read(words) {
    this.cmd = words[1];
    this.atype = words[2];
    this.ax = words[3];
    this.ay = words[4];
    this.ar = words[5];
    this.at = words[6];
    this.av = words[7];
    this.al = words[8];
    this.aowner = words[9];
  },

  build(h) {
    if (h instanceof Table) {
      return this.buildt(h);
    }

    const inst = extend(LExecutor.LInstruction, Object.create(CreateI));
    inst._(h, this.cmd, this.atype, this.ax, this.ay, this.ar, this.at, this.av, this.al, this.aowner);
    return inst;
  },

  buildt(table) {
    //todo dropdown
    table.clearChildren();//this just sounds horrible

    this.fieldlist(table, cmdList, this.cmd, "cmd", table);
    /*
    this.field(table, this.atype, text => {this.atype = text}).width(85);
    this.row(table);
    this.fields(table, "x", this.ax, text => {this.ax = text});
    this.fields(table, "y", this.ay, text => {this.ay = text});
    this.row(table);*/
    switch(Number(this.cmd)){
      case 0:
        this.field(table, this.atype, text => {this.atype = text}).width(85);
        this.row(table);
        this.fields(table, "x", this.ax, text => {this.ax = text});
        this.fields(table, "y", this.ay, text => {this.ay = text});
        this.row(table);
        this.fields(table, "team", this.ar, text => {this.ar = text});
      break;

      case 1:
        table.row();
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          this.field(t, this.atype, text => {this.atype = text}).width(85);
          this.row(t);
          this.fields(t, "x", this.ax, text => {this.ax = text});
          this.fields(t, "y", this.ay, text => {this.ay = text});
          this.row(t);
          this.fields(t, "rotation", this.ar, text => {this.ar = text});
          this.fields(t, "team", this.at, text => {this.at = text});
        })).left();

        //this.row(table);
        table.row();
        if(!LCanvas.useRows()) table.add();
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          this.fields(t, "velocity", this.av, text => {this.av = text});
          this.fields(t, "lifetime", this.al, text => {this.al = text});
          this.row(t);
          this.fields(t, "damage", this.aowner, text => {this.aowner = text});
        })).left();

      break;

      case 2:
        this.field(table, this.atype, text => {this.atype = text}).width(85);
        this.row(table);
        this.fields(table, "x", this.ax, text => {this.ax = text});
        this.fields(table, "y", this.ay, text => {this.ay = text});
        this.row(table);
        this.fields(table, "rotation", this.ar, text => {this.ar = text});
        this.fields(table, "color", this.at, text => {this.at = text});
        //this.row();
        //this.fields(table, "data", this.av, text => {this.av = text});
      break;

      case 3:
        this.field(table, this.atype, text => {this.atype = text}).width(85);
        this.row(table);
        this.fields(table, "x", this.ax, text => {this.ax = text});
        this.fields(table, "y", this.ay, text => {this.ay = text});
        this.row(table);
        this.fields(table, "pitch", this.ar, text => {this.ar = text});
        this.fields(table, "volume", this.at, text => {this.at = text});
      break;

      case 4:
        this.field(table, this.atype, text => {this.atype = text}).width(85);
        this.row(table);
        this.fields(table, "x", this.ax, text => {this.ax = text});
        this.fields(table, "y", this.ay, text => {this.ay = text});
        this.row(table);
        this.fields(table, "amount", this.ar, text => {this.ar = text});
      break;

      default:
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
    table.add(b).size(120, 40).color(table.color).left().padLeft(2);
  },

  write(builder) {
    builder.append("cmdcreate " + this.cmd + "");
    builder.append(" ");
    builder.append(this.atype + "");
    builder.append(" ");
    builder.append(this.ax + "");
    builder.append(" ");
    builder.append(this.ay + "");
    builder.append(" ");
    builder.append(this.ar + "");
    builder.append(" ");
    builder.append(this.at + "");
    builder.append(" ");
    builder.append(this.av + "");
    builder.append(" ");
    builder.append(this.al + "");
    builder.append(" ");
    builder.append(this.aowner + "");
  },

  name: () => "Command: Create",
  category: () => cmdCategory
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("cmdcreate", func(CreateStatement.new));

LogicIO.allStatements.add(prov(() => CreateStatement.new([
  "cmdcreate",
  "0",
  "",
  "0",
  "0",
  "1",
  "1",
  "1",
  "1",
  "-1"
])));
