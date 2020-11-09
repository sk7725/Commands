const cmdList = ["/say", "/title", "/gamerule", "/gamemode", "/ratelimit", "/playsound"];//this playsound will play(), not at()
const rateList = ["say", "popuptitle", "texttitle", "gamerule"];
const titleList = ["hud", "world", "announce", "infoMessage", "infoToast"];

this.global.cmdCategory = LCategory.blocks;
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

    switch(Number(cmd)){
      case 0:
        //say
        if(Vars.net.client()) return; //this is synced
        const str = vm.obj(this.astr) + "";

        if(str == "" || str == "null") return;
        Call.sendMessage(str);
        break;

      case 5:
        //playsound 1
        if(Vars.headless) return;//headless is deaf
        const sound = vm.obj(this.astr) + "";
        if(sound == "" || sound == "null") return;

        var vol = vm.numf(this.atitle);
        vol = Mathf.clamp(vol, 0, 1);
        vol *= (Core.settings.getInt("sfxvol") / 100);

        var pitch = vm.numf(this.a1);
        if(pitch <= 0.00001) pitch = 1;
        pitch = Mathf.clamp(pitch, 0.5, 2.0);
        const pan = Mathf.clamp(vm.numf(this.a2), -1.0, 1.0);

        try{
          Sounds[sound].play(vol, pitch, pan);
        }
        catch(notFound){}
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
        table.add("message");
        this.field(table, this.astr, text => {this.astr = text}).width(0).growX().padRight(3);

        break;

      case 1:
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          t.add("message");
          this.field(t, this.astr, text => {this.astr = text}).width(0).growX();
          t.add("title");
          this.field(t, this.atitle, text => {this.atitle = text}).width(180).padRight(3);
        })).left();

        table.row();
        table.add();
        table.table(cons(t => {
          t.left();
          t.setColor(table.color);
          t.add("type");
          this.fieldlist(t, titleList, this.a1, "a1", table);
          t.add("duration");
          this.field(t, this.a2, text => {this.a2 = text}).width(90);
          t.add("x");
          this.field(t, this.ax, text => {this.ax = text}).width(90);
          t.add("y");
          this.field(t, this.ay, text => {this.ay = text}).width(90);
        })).left();

        break;

      case 2:
        table.add("rule");
        this.field(table, this.astr, text => {this.astr = text});
        table.add("value");
        this.field(table, this.atitle, text => {this.atitle = text}).width(90);
        break;

      case 3:
        table.add("mode");
        this.field(table, this.astr, text => {this.astr = text}).width(90);
        break;

      case 4:
        table.add("type");
        this.fieldlist(table, rateList, this.astr, "astr", table);
        table.add("ticks");
        this.field(table, this.atitle, text => {this.atitle = text}).width(90);
        break;

      case 5:
        table.add("sound");
        this.field(table, this.astr, text => {this.astr = text}).width(120);
        table.add("volume");
        this.field(table, this.atitle, text => {this.atitle = text}).width(90);
        table.add("pitch");
        this.field(table, this.a1, text => {this.a1 = text}).width(90);
        table.add("pan");
        this.field(table, this.a2, text => {this.a2 = text}).width(90);
        break;

      default:
        table.add("[lightgray]invalid command[]");
    }

  },

  fieldlist(table, list, def, defname, parent){
    var b = new Button(Styles.logict);
    var n = Number(def);
    if(isNaN(n) || n < 0 || n >= list.length) this[defname] = 0;
    b.label(prov(() => list[Number(def)]));
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
  category: () => cmdCategory
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
