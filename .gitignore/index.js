// Load modules
const Discord = require("discord.js"),
backup = require("discord-backup"),
client = new Discord.Client(),
settings = {
    prefix: "b!",
    token: "NjQzMjQyNjM0NjkzMDUwMzc5.XcioZg.wC0JSWp3PKxTJANu-juLkpwMZNw"
};

client.on("ready", () => {
    console.log("I'm ready !");
});

client.on("message", async message => {

    let command = message.content.toLowerCase().slice(settings.prefix.length).split(" ")[0];

    let args = message.content.split(' ').slice(1);
    if (!message.content.startsWith(settings.prefix) || message.author.bot || !message.guild) return;

    if(command === "create"){
        if(!message.member.hasPermission("ADMINISTRATOR")){
            return message.channel.send(":x: | Tu dois être administrateur du serveur pour créer une backup!");
        }
        backup.create(message.guild).then((backupID) => {
            message.author.send("La backup à été créé! Pour la charger, écris cette commande sur le serveur de ton choix: `"+settings.prefix+"load "+backupID+"`!");
        });
    }

    if(command === "load"){
        if(!message.member.hasPermission("ADMINISTRATOR")){
            return message.channel.send(":x: | Tu dois être administrateur du serveur pour charger une backup!");
        }
        let backupID = args[0];
        if(!backupID){
            return message.channel.send(":x: | Tu dois spécifier un ID de backup valide !");
        }
        backup.fetch(backupID).then(async () => {
            message.channel.send(":warning: | Lorsque la sauvegarde sera chargée, tous les channels, rôles, etc. seront remplacés! Tapez `-confirmer` pour confirmer!");
                await message.channel.awaitMessages(m => (m.author.id === message.author.id) && (m.content === "-confirmer"), {
                    max: 1,
                    time: 20000,
                    errors: ["time"]
                }).catch((err) => {
                    return message.channel.send(":x: | Temps écoulé! Chargement de la backup annulé!");
                });
                message.author.send(":white_check_mark: | Début du chargement de la backup!");
                // Load the backup
                backup.load(backupID, message.guild).then(() => {
                    backup.delete(backupID);
                }).catch((err) => {
                    return message.author.send(":x: | Désolé, une erreur est survenue ... Veuillez vérifier que je dispose des autorisations d'administrateur!");
                });
        }).catch((err) => {
            return message.channel.send(":x: | Aucune backup trouvé pour `"+backupID+"`!");
        });
    }

    if(command === "infos"){
        let backupID = args[0];
        if(!backupID){
            return message.channel.send(":x: | Tu dois spécifier un ID valide!");
        }
        // Fetch the backup
        backup.fetch(backupID).then((backupInfos) => {
            const date = new Date(backupInfos.createdTimestamp);
            const yyyy = date.getFullYear().toString(), mm = (date.getMonth()+1).toString(), dd = date.getDate().toString();
            const formatedDate = `${yyyy}/${(mm[1]?mm:"0"+mm[0])}-${(dd[1]?dd:"0"+dd[0])}`;
            let embed = new Discord.MessageEmbed()
                .setAuthor("Backup Informations")
                .addField("ID", backupInfos.ID, true)
                .addField("Serveur", backupInfos.guildID, true)
                .addField("Taille", backupInfos.size, true)
                .addField("Créé le", formatedDate, true)
                .setColor("#FF0000");
            message.channel.send(embed);
        }).catch((err) => {
            return message.channel.send(":x: | Aucune backup trouvée pour `"+backupID+"`!");
        });
    }

});

client.login(settings.token);

function timeConverter(t) {
    var a = new Date(t);
    var today = new Date();
    var yesterday = new Date(Date.now() - 86400000);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    if (a.setHours(0,0,0,0) == today.setHours(0,0,0,0))
        return "today, " + hour + ":" + min;
    else if (a.setHours(0,0,0,0) == yesterday.setHours(0,0,0,0))
        return "yesterday, " + hour + ":" + min;
    else if (year == today.getFullYear())
        return date + " " + month + ", " + hour + ":" + min;
    else
        return date + " " + month + " " + year + ", " + hour + ":" + min;
}
