import AppariteurService from "./appariteur.services";

const API_URL = 'https://inbtp-server.onrender.com/api'; // Remplacez par l'URL de votre API

export default {
    Appariteur : new AppariteurService(API_URL),
}