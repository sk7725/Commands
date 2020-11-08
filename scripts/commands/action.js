const cmdList = ["say", "title", "gamerule", "gamemode", "playsound"];//this playsound will play(), not at()

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

    print("Cmd: "+cmd);

    switch(Number(cmd)){
      case 0:
        //say
        if(Vars.net.client()) return; //this is synced
        const str = vm.vars[this.astr].objval+"";
        const name = vm.vars[this.atitle].objval+"";
        print("Trysay: "+str);
        print("Name: "+name);
        if(!(str instanceof String)) return;
        if((name instanceof String) && name != "") Call.sendMessage(str, name, null);
        else Call.sendMessage(str);
        break;

      case 4:
        //playsound 1
        if(Vars.headless) return;//headless is deaf
        const sound = vm.obj(this.astr);
        if(!(sound instanceof String)) return;

        var vol = vm.numf(this.atitle);
        vol = Mathf.clamp(vol, 0, 1)
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
    this.field(table, this.cmd, text => {this.cmd = text});
    switch(Number(this.cmd)){
      case 0:
        table.add("message");
        this.field(table, this.astr, text => {this.astr = text});
        table.add("name");
        this.field(table, this.atitle, text => {this.atitle = text});
        break;

      case 1:
        table.row();
        table.add("message");
        this.field(table, this.astr, text => {this.astr = text});
        table.add("title");
        this.field(table, this.atitle, text => {this.atitle = text});
        table.add("type");
        this.field(table, this.a1, text => {this.a1 = text});
        table.row();
        table.add("duration");
        this.field(table, this.a2, text => {this.a2 = text});
        table.add("x");
        this.field(table, this.ax, text => {this.ax = text});
        table.add("y");
        this.field(table, this.ay, text => {this.ay = text});
        break;

      case 2:
        table.add("rule");
        this.field(table, this.astr, text => {this.astr = text});
        table.add("value");
        this.field(table, this.atitle, text => {this.atitle = text});
        break;

      case 3:
        table.add("mode");
        this.field(table, this.astr, text => {this.astr = text});
        break;

      case 4:
        table.row();
        table.add("sound");
        this.field(table, this.astr, text => {this.astr = text});
        table.add("volume");
        this.field(table, this.atitle, text => {this.atitle = text});
        table.add("pitch");
        this.field(table, this.a1, text => {this.a1 = text});
        table.add("pan");
        this.field(table, this.a2, text => {this.a2 = text});
        break;

      default:
        table.add("[lightgray]invalid command[]");
    }

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
  category: () => LCategory.blocks
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("cmdaction", func(ActionStatement.new));

LogicIO.allStatements.add(prov(() => ActionStatement.new([
  "cmdaction",
  "0",
  "Hello World!",
  "@",
  "1",
  "0",
  "0",
  "0"
])));
