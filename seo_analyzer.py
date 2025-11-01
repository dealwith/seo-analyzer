import re
from collections import Counter

STOP_WORDS = {
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will',
    'with', 'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where', 'who',
    'which', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
    'now', 'or', 'any', 'if', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'all', 'both', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very',
    'one', 'two', 'three', 'would', 'could', 'also', 'much', 'many', 'may',
    'do', 'does', 'did', 'been', 'being', 'i', 'you', 'we', 'our', 'your'
}

def analyze_text(text):
    chars_with_spaces = len(text)

    text_lower = text.lower()
    words = re.findall(r'\b[a-z]+\b', text_lower)
    total_all_words = len(words)

    filtered_words = [word for word in words if word not in STOP_WORDS and len(word) > 2]

    total_filtered_words = len(filtered_words)
    word_counts = Counter(filtered_words)

    results = []
    for word, count in word_counts.most_common():
        percentage = (count / total_filtered_words) * 100
        results.append((word, count, percentage))

    return results, total_filtered_words, chars_with_spaces, total_all_words

def analyze_keyword_combinations(text, n=2):
    text_lower = text.lower()
    words = re.findall(r'\b[a-z]+\b', text_lower)

    filtered_words = [word for word in words if word not in STOP_WORDS and len(word) > 2]

    combinations = []
    for i in range(len(filtered_words) - n + 1):
        combo = ' '.join(filtered_words[i:i+n])
        combinations.append(combo)

    combo_counts = Counter(combinations)

    return combo_counts.most_common(10)

def print_table(results, total_filtered_words, chars_with_spaces, total_all_words):
    print(f"\n{'='*70}")
    print(f"SEO KEYWORD ANALYSIS")
    print(f"{'='*70}")
    print(f"Characters with spaces: {chars_with_spaces}")
    print(f"Total words: {total_all_words}")
    print(f"Total meaningful words analyzed: {total_filtered_words}\n")
    print(f"{'Word':<20} {'Count':>10} {'Percentage':>15}")
    print(f"{'-'*70}")

    for word, count, percentage in results:
        print(f"{word:<20} {count:>10} {percentage:>14.2f}%")

if __name__ == "__main__":
    with open('./text.txt', 'r', encoding='utf-8') as f:
        text = f.read()

    results, total_filtered_words, chars_with_spaces, total_all_words = analyze_text(text)
    print_table(results, total_filtered_words, chars_with_spaces, total_all_words)

    print(f"\n{'='*70}")
    print(f"Top 20 Keywords:")
    print(f"{'='*70}")
    for i, (word, count, percentage) in enumerate(results[:20], 1):
        print(f"{i:2}. {word:<20} ({count:>3} times, {percentage:>5.2f}%)")

    print(f"\n{'='*70}")
    print(f"Top 10 Keyword Combinations (2-word phrases):")
    print(f"{'='*70}")
    two_word_combos = analyze_keyword_combinations(text, n=2)
    for i, (combo, count) in enumerate(two_word_combos, 1):
        print(f"{i:2}. {combo:<40} ({count:>3} times)")

    print(f"\n{'='*70}")
    print(f"Top 10 Keyword Combinations (3-word phrases):")
    print(f"{'='*70}")
    three_word_combos = analyze_keyword_combinations(text, n=3)
    for i, (combo, count) in enumerate(three_word_combos, 1):
        print(f"{i:2}. {combo:<40} ({count:>3} times)")
