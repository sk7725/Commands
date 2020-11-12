const cmdList = ["say", "title", "gamerule", "gamemode", "ratelimit", "playsound", "weather"];//this playsound will play(), not at()
const rateList = ["say", "popuptitle", "texttitle", "bind"];
const titleList = ["hud", "world", "announce", "infoMessage", "infoToast"];
const gamemodeList = ["survival", "sandbox", "attack", "pvp", "editor"];

var ratetimer = new Interval(1);//serverside ratelimit interval
var ratelimitlist = [60, 180, 10, 70];
this.global.commands.ratelimitlist = ratelimitlist;

var prevecore = null;

this.global.cmdCategory = Pal.accent;
const cmdCategory = this.global.cmdCategory;

//partial credits to DeltaNedas
const ActionI = {
  _(builder, cmd, astr, atitle, a1, a2, ax, ay) {
    this.cmd = builder.var(cmd);
    this.astr = builder.var(astr);
    this.atitle = builder.var(atitle);
    this.a1 = builder.var(a1);
    this.a2 = builder.var(a2);
    this.ax = builder.var(ax);
    this.ay = builder.var(ay);
  },

  run(vm) {
    const cmd = vm.numi(this.cmd);

    //print("Cmd: "+cmd);

    switch(cmd){
      case 0:
        //say
        if(Vars.net.client() || !ratetimer.check(0, ratelimitlist[0])) return; //this is synced
        var str = vm.obj(this.astr) + "";

        if(str == "" || str == "null") return;
        Call.sendMessage(str);
        ratetimer.reset(0, 0);
      break;

      case 1:
        //title
      break;

      case 2:
        //gamerule
        var str = vm.obj(this.astr) + "";
        try{
          var rule = Vars.state.rules[str];
          switch(typeof rule){
            case "boolean":
            Vars.state.rules[str] = vm.bool(this.atitle);
            break;
            case "number":
            Vars.state.rules[str] = vm.numf(this.atitle);
            break;
            default:
            //nope.
          }
        }
        catch(ruleNotFound){}
      break;

      case 3:
        //gamemode
        var type = vm.numi(this.astr);
        if(type > 4 || type < 0) return;
        if(type != 4 && prevecore !== null){
          Vars.state.rules.enemyCoreBuildRadius = prevecore;
          prevecore = null;
          Vars.state.rules.editor = false;
        }
        switch(type){
          case 0:
          Vars.state.rules.waveTimer = true;
          Vars.state.rules.waves = true;
          Vars.state.rules.infiniteResources = false;
          Vars.state.rules.attackMode = false;
          Vars.state.rules.pvp = false;
          break;
          case 1:
          Vars.state.rules.waveTimer = false;
          Vars.state.rules.waves = true;
          Vars.state.rules.infiniteResources = true;
          Vars.state.rules.attackMode = false;
          Vars.state.rules.pvp = false;
          break;
          case 2:
          Vars.state.rules.waveTimer = true;
          Vars.state.rules.waves = true;
          Vars.state.rules.infiniteResources = false;
          Vars.state.rules.attackMode = true;
          Vars.state.rules.pvp = false;
          break;
          case 3:
          Vars.state.rules.waveTimer = true;
          Vars.state.rules.waves = true;
          Vars.state.rules.infiniteResources = false;
          Vars.state.rules.attackMode = true;
          Vars.state.rules.pvp = true;
          break;
          case 4:
          Vars.state.rules.waveTimer = false;
          Vars.state.rules.waves = false;
          Vars.state.rules.infiniteResources = true;
          Vars.state.rules.attackMode = false;
          Vars.state.rules.pvp = false;
          Vars.state.rules.editor = true;
          if(prevecore === null) prevecore = Vars.state.rules.enemyCoreBuildRadius - 0;
          Vars.state.rules.enemyCoreBuildRadius = 0;
          break;
          default:
        }
      break;

      case 4:
        //ratelimit
        if(Vars.net.client()) return;
        var type = vm.numi(this.astr);
        var ticks = vm.numi(this.atitle);
        if(type < 0 || type > 3 || ticks < 0) return;
        ratelimitlist[type] = ticks;
      break;

      case 5:
        //playsound 1
        if(Vars.headless) return;//headless is deaf
        var sound = vm.obj(this.astr) + "";
        if(sound == "" || sound == "null") return;

        var vol = vm.numf(this.atitle);
        vol = Mathf.clamp(vol, 0, 1);
        vol *= (Core.settings.getInt("sfxvol") / 100);

        var pitch = vm.numf(this.a1);
        if(pitch <= 0.00001) pitch = 1;
        //pitch = Mathf.clamp(pitch, 0.5, 2.0);
        var pan = Mathf.clamp(vm.numf(this.a2), -1.0, 1.0);

        try{
          Sounds[sound].play(vol, pitch, pan);
        }
        catch(notFound){}
      break;

      case 6:
        //weather
        var weather = vm.obj(this.astr);
        if(!(weather instanceof Weather)) return;
        if(!weather.isActive()) weather.create(vm.numf(this.a1), vm.numf(this.atitle));
      break;

      default:

      //end
    }
  }
};

const ActionStatement = {
  new: words => {
    const st = extend(LStatement, Object.create(ActionStatement));
    st.read(words);
    return st;
  },

  read(words) {
    this.cmd = words[1];
    this.astr = words[2];
    this.atitle = words[3];
    this.a1 = words[4];
    this.a2 = words[5];
    this.ax = words[6];
    this.ay = words[7];
  },

  build(h) {
    if (h instanceof Table) {
      return this.buildt(h);
    }

    const inst = extend(LExecutor.LInstruction, Object.create(ActionI));
    inst._(h, this.cmd, this.astr, this.atitle, this.a1, this.a2, this.ax, this.ay);
    return inst;
  },

  buildt(table) {
    //todo dropdown
    table.clearChildren();//this just sounds horrible

    this.fieldlist(table, cmdList, this.cmd, "cmd", table);
    switch(Number(this.cmd)){
      case 0:
        table.add(" message");
        this.field(table, this.astr, text => {this.astr = text}).width(0).growX().padRight(3);

        break;

      case 1:
        this.row(table);
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          t.add(" message");
          this.field(t, this.astr, text => {this.astr = text}).width(0).growX();
          this.row(t);
          t.add(" title")
          this.field(t, this.atitle, text => {this.atitle = text}).width(180).padRight(3);
        })).left();

        table.row();
        if(!LCanvas.useRows()) table.add();
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          t.add(" type");
          this.fieldlist(t, titleList, this.a1, "a1", table);
          this.fields(t, "duration", this.a2, text => {this.a2 = text});
          this.row(t);
          this.fields(t, "x", this.ax, text => {this.ax = text});
          this.fields(t, "y", this.ay, text => {this.ay = text});
        })).left();
      break;

      case 2:
        this.row(table);
        this.fields(table, "rule", this.astr, text => {this.astr = text}).width(180);
        this.row(table);
        this.fields(table, "value", this.atitle, text => {this.atitle = text});
        break;

      case 3:
        table.add(" mode");
        this.fieldlist(table, gamemodeList, this.astr, "astr", table);
      break;

      case 4:
        table.add(" type");
        this.fieldlist(table, rateList, this.astr, "astr", table);
        this.row(table);
        this.fields(table, "ticks", this.atitle, text => {this.atitle = text});
      break;

      case 5:
        this.row(table);
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          this.fields(t, "sound", this.astr, text => {this.astr = text});
          this.fields(t, "volume", this.atitle, text => {this.atitle = text});
          this.row(t);
          this.fields(t, "pitch", this.a1, text => {this.a1 = text});
          this.fields(t, "pan", this.a2, text => {this.a2 = text});
        })).left();
      break;

      case 6:
        this.row(table);
        this.field(table, this.astr, text => {this.astr = text}).width(85).left();
        this.row(table);
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          this.fields(t, "duration", this.atitle, text => {this.atitle = text});
          this.fields(t, "intensity", this.a1, text => {this.a1 = text});
        })).left();

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
    builder.append("cmdaction " + this.cmd + "");
    builder.append(" ");
    builder.append(this.astr + "");
    builder.append(" ");
    builder.append(this.atitle + "");
    builder.append(" ");
    builder.append(this.a1 + "");
    builder.append(" ");
    builder.append(this.a2 + "");
    builder.append(" ");
    builder.append(this.ax + "");
    builder.append(" ");
    builder.append(this.ay + "");
  },

  name: () => "Command: Action",
  color: () => cmdCategory
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("cmdaction", func(ActionStatement.new));

LogicIO.allStatements.add(prov(() => ActionStatement.new([
  "cmdaction",
  "0",
  '""',
  "",
  "1",
  "0",
  "0",
  "0"
])));
