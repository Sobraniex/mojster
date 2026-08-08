# Mojster v1.0.0

Profesionalna obrtniška platforma (Expo / React Native) za domača dela in freelancerske storitve.

**Repo:** [Sobraniex/mojster](https://github.com/Sobraniex/mojster)

## Kaj je

Marketplace kjer:

- **Stranke** objavijo delo (brez cene na listi) — mojstri pošljejo ponudbe v app-u  
- **Mojstri** aktivirajo profil z **naročnino** (plačilo ob vstopu), nato iščejo dela in pošiljajo ponudbe  

## Funkcije (1.0.0)

- Ločen vstop: *Potrebujem delo* / *Iščem delo*  
- Profil: ime, priimek, e-mail, telefon  
- 18 storitev (barvanje, vodovod, klima, električar, selitve…)  
- Objava del s fotografijami (brez cene na objavi)  
- Ponudbe in dogovor v app-u  
- Plačilni sistem za mojstre (paketi 29 € / 69 € / 199 €)  
- Premium UI + phone frame na webu  

## Zagon

```bash
cd mojster
npm install
npx expo start
# ali web:
EXPO_NO_TYPESCRIPT_SETUP=1 npx expo start --web --port 3131
```

## Stack

- Expo SDK 57 + Expo Router  
- TypeScript  
- AsyncStorage (lokalni demo backend)  

## Licenca

Glej `LICENSE`.
