const cmdList = ["say", "title", "gamerule", "gamemode", "ratelimit", "playsound", "weather"];//this playsound will play(), not at()
const rateList = ["say", "popuptitle", "texttitle", "bind"];
const titleList = ["hud", "world", "announce", "infoToast", "popup", "infoPopup", "error", "notice"];
const rltype = [2, 2, 2, 2, 1, 1, 1, 1];

const gamemodeList = ["survival", "sandbox", "attack", "pvp", "editor"];

var ratetimer = new Interval(3);//serverside ratelimit interval
var ratelimitlist = [60, 180, 10, 70];
this.global.commands.ratelimitlist = ratelimitlist;

var prevecore = null;

this.global.cmdCategory = Pal.accent;
const cmdCategory = this.global.cmdCategory;

//const iconList = Object.keys(Icon).filter(s => (typeof Icon[s]) == "object").sort();

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
        var mode = vm.numi(this.a1);
        var str = vm.obj(this.astr) + "";
        if(mode < 0 || mode >= titleList.length) return;
        var rt = rltype[mode];
        if(Vars.headless || !ratetimer.check(rt, ratelimitlist[rt])) return;
        //Vars.ui.hudfrag.showToast(icon, text), (text)
        switch(mode){
          case 0:
            if(!vm.bool(this.astr)) Vars.ui.hudfrag.toggleHudText(false);
            else Vars.ui.hudfrag.setHudText(str);
          break;
          case 1:
            var duration = vm.numf(this.a2);
            if(duration <= 0) return;
            var cx = vm.numf(this.ax) * Vars.tilesize; var cy = vm.numf(this.ay) * Vars.tilesize;
            if(cx <= 0.00001 || cy <= 0.00001 || cx >= Vars.world.unitWidth() || cy >= Vars.world.unitHeight()) return;
            Vars.ui.showLabel(str, duration / 60, cx, cy);
          break;
          case 2:
            var duration = vm.numf(this.a2);
            if(duration <= 0) return;
            Vars.ui.announce(str, duration / 60);
          break;
          case 3:
            var duration = vm.numf(this.a2);
            if(duration <= 0) return;
            Vars.ui.showInfoToast(str, duration / 60);
          break;
          case 4:
            var title = vm.obj(this.atitle) + "";
            if(title == "null" || title == "undefined") title = "";
            Vars.ui.showText(title, str);
          break;
          case 5:
            var title = vm.obj(this.atitle) + "";
            if(title == "null" || title == "undefined") title = "";
            Vars.ui.showInfoText(title, str);
          break;
          case 6:
            Vars.ui.showErrorMessage(str);
          break;
          case 7:
            var icon = vm.obj(this.atitle);
            try{
              Vars.ui.hudfrag.showToast(Icon[icon + ""], str);
            }
            catch(notFound){
              Vars.ui.hudfrag.showToast(str);
            }
          break;
          default:
        }
        ratetimer.reset(rt, 0);
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
        //print(weather);
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
    this.cmd = (isNaN(Number(words[1]))) ? cmdList.indexOf(words[1]) : words[1];
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
          if(this.a1 == 4 || this.a1 == 5 || this.a1 == 7){
            this.row(t);
            t.add((this.a1 == 7)? " icon" : " title");
            this.field(t, this.atitle, text => {this.atitle = text}).width(180).padRight(3);
          }

        })).left();

        table.row();
        if(!LCanvas.useRows()) table.add();
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          t.add(" type");
          this.fieldlist(t, titleList, this.a1, "a1", table);
          if(this.a1 == 1 || this.a1 == 2 || this.a1 == 3) this.fields(t, "duration", this.a2, text => {this.a2 = text});
          //hud, world, announce, infomessage, infotoast
          if(this.a1 == 1){
            this.row(t);
            this.fields(t, "x", this.ax, text => {this.ax = text});
            this.fields(t, "y", this.ay, text => {this.ay = text});
          }
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
    builder.append("cmdaction " + cmdList[this.cmd] + "");
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
