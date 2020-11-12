const cmdList = ["tp", "damage", "kill", "give", "clear", "effect", "team", "bind"];
const tpList = ["-", "angle", "facing"];
const effectList = ["apply", "clear"];
const damageList = ["points", "%", "f"];
const giveList = ["keep", "force"];

const cmdCategory = this.global.cmdCategory;

var ratetimer = new Interval(1);
var rllist = this.global.commands.ratelimitlist;

//partial credits to DeltaNedas
const EntityI = {
  _(builder, cmd, atype, ax, ay, ar, at, av) {
    this.cmd = builder.var(cmd);
    this.atype = builder.var(atype);
    this.ax = builder.var(ax);
    this.ay = builder.var(ay);
    this.ar = builder.var(ar);
    this.at = builder.var(at);
    this.av = builder.var(av);
  },

  validPos(x, y){
    return !(x <= 0.00001 || y <= 0.00001 || x >= Vars.world.unitWidth() || y >= Vars.world.unitHeight());
  },

  run(vm) {
    const cmd = vm.numi(this.cmd);

    var ent = vm.obj(this.atype);
    //var cx = vm.num(this.ax) * Vars.tilesize;
    //var cy = vm.num(this.ay) * Vars.tilesize;

    //if((type == null && cmd != 5) || cx <= 0.00001 || cy <= 0.00001 || cx >= Vars.world.unitWidth() || cy >= Vars.world.unitHeight()) return;

    switch(cmd){
      case 0:
        //tp
        if(ent == null) return;
        var cx = vm.num(this.ax) * Vars.tilesize;
        var cy = vm.num(this.ay) * Vars.tilesize;
        if(!this.validPos(cx, cy)) return;
        this.tp(vm, ent, cx, cy);
      break;
      case 1:
        //damage
        if(ent == null) return;
        this.damage(vm, ent);
      break;
      case 2:
        //kill
        if(ent == null) return;
        this.kill(vm, ent);
      break;
      case 3:
        //give
        if(ent == null) return;
        var item = vm.obj(this.ax);
        if(item == null) return;
        if(item instanceof Item){
          this.give(vm, ent, item);
        }
        else if(item instanceof Liquid){
          this.giveliquid(vm, ent, item);
        }
      break;
      case 4:
        //clear
        if(ent == null) return;
        this.clear(vm, ent);
      break;
      case 5:
        //kill
        if(ent == null) return;
        this.effect(vm, ent);
      break;
      case 6:
        //kill
        if(ent == null) return;
        this.team(vm, ent);
      break;
      case 7:
        //bind
        if(ent == null) return;
        if((ent instanceof Unit) && ent.isPlayer()){
          var cunit = vm.obj(this.ax);
          if(cunit == ent) return;
          if(cunit == null){
            if(!ent.spawnedByCore) this.unbind(vm, ent);
          }
          else if((cunit instanceof Unit) && !cunit.isPlayer()){
            this.bind(vm, ent, cunit);
          }
          else if((cunit instanceof ControlBlock) && cunit.canControl() && !cunit.isControlled()){
            this.bind(vm, ent, cunit.unit);
          }
        }
        else if((ent instanceof ControlBlock) && ent.isControlled()){
          var cunit = vm.obj(this.ax);
          if(cunit == ent) return;
          if(cunit == null){
            this.unbind(vm, ent.unit);
          }
          else if((cunit instanceof Unit) && !cunit.isPlayer()){
            this.bind(vm, ent.unit, cunit);
          }
          else if((cunit instanceof ControlBlock) && cunit.canControl() && !cunit.isControlled()){
            this.bind(vm, ent.unit, cunit.unit);
          }
        }
      break;
      default:

      //end
    }
  },

  tp(vm, ent, cx, cy){
    if(ent instanceof Unit){
      ent.set(cx, cy);
      ent.snapInterpolation();
      switch(vm.numi(this.ar)){
        case 1:
        ent.rotation = vm.numf(this.at);
        break;
        case 2:
        var ex = vm.num(this.at) * Vars.tilesize;
        var ey = vm.num(this.av) * Vars.tilesize;
        if(!this.validPos(ex, ey)) return;
        ent.rotation = Tmp.v1.set(ex - ent.x, ey - ent.y).angle();
        break;
      }
    }
    else if(ent instanceof Bullet){
      ent.set(cx, cy);
      switch(vm.numi(this.ar)){
        case 1:
        ent.rotation(vm.numf(this.at));
        break;
        case 2:
        var ex = vm.num(this.at) * Vars.tilesize;
        var ey = vm.num(this.av) * Vars.tilesize;
        if(!this.validPos(ex, ey)) return;
        ent.rotation(Tmp.v1.set(ex - ent.x, ey - ent.y).angle());
        break;
      }
    }
    else return;
  },
  kill(vm, ent){
    if(ent instanceof Healthc) ent.kill();
    else if(ent instanceof Bullet) ent.remove();
  },
  damage(vm, ent){
    if(!(ent instanceof Healthc)) return;
    var amount = vm.numf(this.ax);
    if(amount < 0){
      switch(vm.numi(this.ay)){
        case 0:
        ent.heal(-1 * amount);
        break;
        case 1:
        ent.healFract(-1 * amount / 100);
        break;
        case 2:
        ent.healFract(-1 * amount);
        break;
      }
    }
    else{
      switch(vm.numi(this.ay)){
        case 0:
        ent.damage(amount);
        break;
        case 1:
        ent.damage(ent.maxHealth * amount / 100);
        break;
        case 2:
        ent.damage(ent.maxHealth * amount);
        break;
      }
    }
  },
  effect(vm, ent){
    if(!(ent instanceof Statusc)) return;
    var stat = vm.obj(this.ax);
    if(stat == null || !(stat instanceof StatusEffect)) return;
    if(vm.numi(this.ay) == 0){
      //apply
      ent.apply(stat, Math.max(0, vm.numf(this.ar)));
    }
    else{
      ent.unapply(stat);
    }
  },
  team(vm, ent){
    if(ent instanceof Unit){
      if(ent.isPlayer()) ent.getPlayer().team(Team.get(vm.numi(this.ax)));
      else ent.team = Team.get(vm.numi(this.ax));
    }
    else if(ent instanceof Teamc){
      ent.team = Team.get(vm.numi(this.ax));
    }
  },
  clear(vm, ent){
    if(ent instanceof Itemsc){
      ent.clearItem();
    }
    else if((ent instanceof Building) && ent.items != null) ent.items.clear();
  },
  give(vm, ent, item){
    if(ent instanceof Itemsc){
      if(!(vm.numi(this.ar) == 0) || ent.acceptsItem(item)) ent.addItem(item, vm.numi(this.ay));
    }
    else if((ent instanceof Building) && ent.items != null){
      var amount = vm.numi(this.ay);
      if(amount == 0) return;
      if(amount > 0){
        var real = (vm.numi(this.ar) == 0 || (ent.block instanceof Turret)) ? ent.acceptStack(item, amount, null) : Math.min(amount, ent.getMaximumAccepted(item) - ent.items.get(item));
        if(real <= 0) return;
        ent.handleStack(item, real, null);
      }
      else{
        ent.items.remove(item, -1 * amount);
      }
    }
  },
  giveliquid(vm, ent, liquid){
    if(!(ent instanceof Building) || (ent.block instanceof LiquidTurret)) return;
    if(ent.liquids == null) return;
    var amount = vm.numf(this.ay);
    if(amount == 0) return;
    if(amount > 0){
      if(!(vm.numi(this.ar) == 0) || (ent.block.hasLiquids && ent.block.consumes != null && ent.block.consumes.liquidfilters.get(liquid.id))){
        var real = Math.min(amount, ent.block.liquidCapacity - ent.liquids.get(liquid));
        if(real <= 0) return;
        ent.liquids.add(liquid, amount);
      }
    }
    else{
      ent.liquids.add(liquid, Math.max(amount, -1 * ent.liquids.get(liquid)));
    }
  },
  bind(vm, player, unit){
    if(Vars.player == player.getPlayer() && ratetimer.get(0, rllist[3])){
      Call.unitControl(player.getPlayer(), unit);
      Vars.control.input.shouldShoot = false;
    }
  },
  unbind(vm, player){
    //call should work...?
    if(Vars.player == player.getPlayer() && ratetimer.get(0, rllist[3])){
      Call.unitClear(player.getPlayer());
      Vars.control.input.controlledType = null;
    }
  }
};

const EntityStatement = {
  new: words => {
    const st = extend(LStatement, Object.create(EntityStatement));
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
  },

  build(h) {
    if (h instanceof Table) {
      return this.buildt(h);
    }

    const inst = extend(LExecutor.LInstruction, Object.create(EntityI));
    inst._(h, this.cmd, this.atype, this.ax, this.ay, this.ar, this.at, this.av);
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
        //tp
        this.field(table, this.atype, text => {this.atype = text}).width(85);
        this.row(table);
        this.fields(table, "x", this.ax, text => {this.ax = text});
        this.fields(table, "y", this.ay, text => {this.ay = text});
        this.row(table);
        this.fieldlist(table, tpList, this.ar, "ar", table).width(85);
        if(this.ar == 1 || this.ar == 3){
          //angle,lookat
          this.field(table, this.at, text => {this.at = text}).width(85);
        }
        else if(this.ar == 2){
          this.row(table);
          this.fields(table, "x", this.at, text => {this.at = text});
          this.fields(table, "y", this.av, text => {this.av = text});
        }
      break;

      case 1:
        //damage
        this.field(table, this.atype, text => {this.atype = text}).width(85);
        this.row(table);
        this.fields(table, "amount", this.ax, text => {this.ax = text});
        this.fieldlist(table, damageList, this.ay, "ay", table).width(85);
      break;

      case 2:
        //kill
        this.field(table, this.atype, text => {this.atype = text}).width(85);
      break;

      case 3:
        //give
        this.field(table, this.atype, text => {this.atype = text}).width(85);
        this.row(table);
        this.fields(table, "item", this.ax, text => {this.ax = text});
        this.row(table);
        this.fields(table, "amount", this.ay, text => {this.ay = text});
        this.fieldlist(table, giveList, this.ar, "ar", table).width(85);
      break;

      case 4:
        //clear
        this.field(table, this.atype, text => {this.atype = text}).width(85);
      break;

      case 5:
        //effect
        this.field(table, this.atype, text => {this.atype = text}).width(85);
        this.row(table);
        this.fields(table, "status", this.ax, text => {this.ax = text});
        this.fieldlist(table, effectList, this.ay, "ay", table).width(85);
        if(this.ay == 0){
          this.row(table);
          this.fields(table, "ticks", this.ar, text => {this.ar = text});
        }
      break;

      case 6:
        //team
        this.field(table, this.atype, text => {this.atype = text}).width(85);
        this.row(table);
        this.fields(table, "team", this.ax, text => {this.ax = text});
      break;

      case 7:
        //bind
        this.row(table);
        this.fields(table, "player", this.atype, text => {this.atype = text}).width(85);
        this.row(table);
        this.fields(table, "unit", this.ax, text => {this.ax = text});
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
    return table.add(b).size(120, 40).color(table.color).left().padLeft(2);
  },

  write(builder) {
    builder.append("cmdentity " + this.cmd + "");
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
  },

  name: () => "Command: Entity",
  color: () => cmdCategory
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("cmdentity", func(EntityStatement.new));

LogicIO.allStatements.add(prov(() => EntityStatement.new([
  "cmdentity",
  "0",
  "unit",
  "0",
  "0",
  "0",
  "0",
  "0"
])));
