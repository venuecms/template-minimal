export default function Home() {
  return (
    <main className="flex py-24 gap-32">
      <div className="min-w-[32rem] text-text-2 text-sm gap-6 flex">
        <div className="flex flex-col gap-12">
          <div>
            <div>Thursday 6 February 2025 </div>
            <div>Nicola Ratti & Cara Tolmie</div>
            <div>Fylkingen Bredäng</div>
          </div>
          <div className="flex gap-8">
            <div>$25 at the door</div>
            <div>$20 adv</div>
            <div>$10 members</div>
          </div>
        </div>
      </div>

      <div>
        <p className="max-w-[42rem] text-sm">
          Double bill with the synthesised sound environments of Italian sound
          artist Nicola Ratti's Automatic Popular Music and a performance by
          Cara Tolmie whose work with internal singing and the displaced vocal
          body probes the site-specific conditions of performance-making.
        </p>
      </div>
    </main>
  );
}
