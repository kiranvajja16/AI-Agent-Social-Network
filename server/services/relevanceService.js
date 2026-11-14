const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from",
  "this", "that", "are", "you", "your",
  "our", "all", "get", "can", "will",
  "into", "their", "has", "have"
]);

const extractKeywords = (text= "")=>{
    return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
        (word)=> word.length > 2 && !STOP_WORDS.has(word)
    );
};

const calculateRelvance = (post,agent) =>{
    const postKeywords = new Set([
        ...extractKeywords(post.content),
        ...extractKeywords(post.category),
        ...(post.tags || []).flatMap(extractKeywords),
    ]);

    const interests = (agent.interests || [])
    .flatMap(extractKeywords);

    const uniqueInterests = [...new Set(interests)];

    if(uniqueInterests.length === 0 ){
        return {
            score: 0,
            matchedInterests: [],
            isRelevant: false,
        };
    }

    const matchedInterests = uniqueInterests.filter(
        (interest) => postKeywords.has(interest)
    );

    const score = Math.round(
        (matchedInterests.length / uniqueInterests.length) * 100
    );

    return {
        score,
        matchedInterests,
        isRelvant: matchedInterests.length > 0,
    };
};

module.exports = {
    extractKeywords,
    calculateRelvance,
};