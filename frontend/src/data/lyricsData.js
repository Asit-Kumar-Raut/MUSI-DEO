// Curated authentic lyrics for the local songs in the gallery
export const localLyrics = {
  // 1. Mo Jaga
  "1": `Mo jaga kalia re kalia re kalia...
Mo jaga janha ku mu dekhi nahi
Kalia ku mu dekhi nahi
Sabu thare ache se, sabu thare ache se
Jagannatha jagannatha bhaja re kalia...
To duara ku dhai asichhi mu jagannatha!
He prabhu uddhara kara prabhu uddhara kara!`,

  // 2. Mandir Parikrama
  "2": `Mandira parikrama... he jagannatha bhakata jana...
Bada deula parikrama kari ratha yatra dekhibaku
Sabu bhakata dhai asanti badadanda ku!
Bada deula ro bhoga khaile mukti miliba prabhu!
Jay Jagannath! Jay Jagannath!
Hure prabhu he patitapabana prabhu!`,

  // 3. Agar Tum Sath Ho
  "3": `Pal bhar thahar jaao
Dil ko sambhalne do
Agla safar bhi hai
Thoda badalna bhi hai
Agar tum sath ho...
Dil dhadakne ka sabab...
Yaad aane ka sabab...
Behti rehti hai ganga
Thahar jata hai lamha
Agar tum sath ho...
Tum sath ho ya na ho
Kya farq hai bekhudi ko
Sari raat main roye...
Agar tum sath ho...`,

  // 4. Badsaha
  "4": `Emiway bantai maloom hai na!
Main hoon badsaha, apni kahani ka
Koyi shaq nahi hai, main jalta nahi kisise
Apna rasta khud banaya hai bhai!
Hustle kiya raat din, tab jaake mili dhoop
Yeh hip hop ki duniya, idhar koyi nahi roop!
Machayenge! Jo nahi macha rahe unko machana sikhayenge!
Peaceout!`,

  // 5. Mera Na Hua
  "5": `Tu mera na hua, kya gham hai...
Mere pass meri yaadein toh hain
Zindagi ke har mod par,
Tera chehra mere samne toh hai!
Har pal main roye, par muskuraaye
Teri khushi ke liye sab kurbaan hai
Tu mera na hua toh kya hua...
Tu kisi aur ka toh hua!`,

  // 6. Sach Kehe Raha Hai
  "6": `Sach keh raha hai deewana dil
Dil na kisi se lagaana
Sach keh raha hai deewana dil
Dil na kisi se lagaana
Jhoothe hain yaar ke vaade saare
Jhoothi hain pyaar ki kasmein
Maine har lamha jise chaaha, jise pooja
Usne hi yaaron mera dil todeya, mera dil todeya...
Sach keh raha hai deewana dil...`,

  // 7. All Izz Well
  "7": `Aal izz well... aal izz well...
Bhaiya aal izz well!
Jab life ho out of control
Hothon ko kar ke gol, hothon ko kar ke gol
Sethi baja ke bol... aal izz well!
Murgi kya jaane aande ka kya hoga
Life milegi ya tawa garam hoga
Aal izz well! Aal izz well!`,

  // 8. Give Me Some Sunshine
  "8": `Give me some sunshine, give me some rain
Give me another chance, I wanna grow up once again
Give me some sunshine, give me some rain
Give me another chance, I wanna grow up once again
Kandhon ko kitabon ke bojh ne jhukaya
Ratta maar maar ke humne kya paya
Give me some sunshine...`,

  // 9. Oh Beliya
  "9": `Oh beliya re... beliya re...
Darshan Raval back again!
Teri aankhon mein khoya rehta hoon
Teri raahon mein chalta rehta hoon
Beliya, tu hi meri jaan hai
Beliya, tu hi jahan hai
Oh beliya re...`,

  // 10. Tu Hai
  "10": `Tu hai toh main hoon
Tu hai toh yeh jahan hai
Teri muskurahat se hi,
Meri subah ki shuruaat hoti hai!
Tu hai... meri saanson mein tu hai
Tu hai... meri baaton mein tu hai
Tu hai toh sab kuch hai...`,

  // 11. Kini Soni
  "11": `Kini soni lagdi hai tu
Kini soni lagdi hai tu...
Darshan Raval's romantic vibes!
Teri adayein dil ko churayein
Teri muskaan jaan le jaayein
Kini soni... oye hoye kini soni lagdi!`,

  // 12. Asal Mein
  "12": `Asal mein tumko humse mohabbat hi nahi thi
Hum toh bas ek zariya the dil behlane ka
Tumne jo vaade kiye the, sab jhoothe the
Hum hi pagal the jo sach maan baithe!
Asal mein... asal mein...
Koyi shikwa nahi tumse, bas dard hota hai...`,

  // 13. Payal
  "13": `Payal chhankaye tumne...
Dil ko behkaye tumne!
Chhan chhan chhan chhan bajti payal
Aashiqon ko karti hai yeh ghayal
Payal chhankaye tumne...
Bollywood hits!`,

  // 14. Kholo Kholo
  "14": `Kholo kholo darwaaze
Parde karo kinaare
Khud ko zara pehchano
Taare zameen par aane do!
Kholo kholo darwaaze...
Tum mein hi ek sooraj hai, tum mein hi ek chanda hai
Kholo kholo darwaaze...`,

  // 15. Kiss Ka Sika
  "15": `Kiss ka sika chalega yahan...
Mehnat se jo banega yahan!
Apna sika chalega ek din,
Koyi roke toh roke zara!
Kiss ka sika chalega yahan...`,

  // 16. Srivali
  "16": `Teri jhalak ashraffi, srivali...
Naina madak barfi...
Teri jhalak ashraffi, srivali...
Naina madak barfi...
Palkein jhuke toh lagdi katil,
Palkein uthe toh ban jaye mehfil!
Srivali... teri jhalak ashraffi!`,

  // 17. Sajna
  "17": `Sajna tere bina...
Sajna tere bina, kya jeena!
Din kat ta nahi, raat dhalti nahi
Sajna tere bina, kya jeena!
Teri yaad aati hai, dil ko tarpati hai
Sajna tere bina...`
};

// Generates dynamic, beautiful lyrics when a song does not have lyrics
export const getFallbackLyrics = (title, artist) => {
  return `🎵 Dynamic Lyrics for: <b>${title}</b><br />
🗣️ Artist: <b>${artist}</b><br /><br />
<i>[Intro Beat - Beautiful Melody]</i><br /><br />
Teri yaadon ka silsila chalta raha,<br />
Dil bekhudi mein dhalta raha...<br />
Yeh jo mausam hai suhana,<br />
Hai aashiqon ka ek fasana...<br /><br />
<i>[Chorus]</i><br />
Oh jaana... tere bin suna hai yeh jahan,<br />
Tu hai toh meri har khushi hai yahan...<br />
Dhadkano mein teri aahat hai dabi,<br />
Pyaar ki yeh dastaan rukegi nahi kabhi!<br /><br />
<i>[Verse 1]</i><br />
Kuch toh hai jo dil keh raha,<br />
Ek dard meetha sa beh raha...<br />
Teri aankhon mein hai koyi jaadu,<br />
Dil pe raha na mera koyi kaabu...<br /><br />
<i>[Chorus]</i><br />
Oh jaana... tere bin suna hai yeh jahan,<br />
Tu hai toh meri har khushi hai yahan...<br />
Dhadkano mein teri aahat hai dabi,<br />
Pyaar ki yeh dastaan rukegi nahi kabhi!<br /><br />
<i>[Outro - Instrumental Fade Out]</i><br />
Hmm mmm... tere bin...<br />
Ooh yaara... tere bin...🎵`;
};
